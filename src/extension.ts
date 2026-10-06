import * as vscode from 'vscode';
import * as path from 'path';
import { getIdentity, repoRoot, setIdentity } from './git';
import { Lang, messages, resolveLang } from './messages';
import {
  PRESET_COLORS,
  Profile,
  findByIdentity,
  isValidColor,
  normalize,
  registerInitProfile,
  removeProfile,
  replaceProfile,
  validateProfile,
} from './profiles';

let statusBar: vscode.StatusBarItem;
let configWatcher: vscode.FileSystemWatcher | undefined;
let watchedRoot: string | undefined;

export function activate(context: vscode.ExtensionContext): void {
  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.command = 'gitProfileSwitcher.switchProfile';
  context.subscriptions.push(statusBar, { dispose: () => configWatcher?.dispose() });

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('gitProfileSwitcher.enabled')) {
        onEnabledChanged();
      } else if (e.affectsConfiguration('gitProfileSwitcher')) {
        refresh();
      }
    }),
    vscode.window.onDidChangeActiveTextEditor(() => refresh()),
    vscode.workspace.onDidChangeWorkspaceFolders(() => refresh()),
    // user.name/email bisa diubah dari terminal; cek ulang saat window kembali fokus.
    vscode.window.onDidChangeWindowState((s) => s.focused && refresh()),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('gitProfileSwitcher.activation', async () => {
      const current = config().get<boolean>('enabled', false);
      const picked = await vscode.window.showQuickPick(
        [true, false].map((value) => ({
          label: String(value),
          description: value === current ? t().current() : undefined,
          value,
        })),
        { placeHolder: t().activationPlaceholder() },
      );
      if (!picked || picked.value === current) {
        return;
      }
      // Disimpan di user settings supaya berlaku di semua project yang membuka VS Code dengan extension ini.
      await config().update('enabled', picked.value, vscode.ConfigurationTarget.Global);
      // Nilai lama di workspace (versi sebelumnya) akan menimpa user settings, jadi dibersihkan.
      const inspected = config().inspect<boolean>('enabled');
      if (inspected?.workspaceValue !== undefined) {
        await config().update('enabled', undefined, vscode.ConfigurationTarget.Workspace);
      }
      if (inspected?.workspaceFolderValue !== undefined) {
        const folder = vscode.workspace.workspaceFolders?.[0];
        await vscode.workspace
          .getConfiguration('gitProfileSwitcher', folder)
          .update('enabled', undefined, vscode.ConfigurationTarget.WorkspaceFolder);
      }
      vscode.window.showInformationMessage(picked.value ? t().enabled() : t().disabled());
    }),
    vscode.commands.registerCommand('gitProfileSwitcher.language', async () => {
      const current = currentLang();
      const options: { label: string; value: Lang }[] = [
        { label: 'English', value: 'en' },
        { label: 'Bahasa Indonesia', value: 'id' },
      ];
      const picked = await vscode.window.showQuickPick(
        options.map((o) => ({ ...o, description: o.value === current ? t().current() : undefined })),
        { placeHolder: t().languagePlaceholder() },
      );
      if (!picked || picked.value === current) {
        return;
      }
      await config().update('language', picked.value, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(t().languageChanged());
    }),
    vscode.commands.registerCommand('gitProfileSwitcher.switchProfile', () => guard(switchProfile)),
    vscode.commands.registerCommand('gitProfileSwitcher.addProfile', () => guard(addProfile)),
    vscode.commands.registerCommand('gitProfileSwitcher.editProfile', () => guard(editProfile)),
    vscode.commands.registerCommand('gitProfileSwitcher.deleteProfile', () => guard(deleteProfile)),
    vscode.commands.registerCommand('gitProfileSwitcher.setColor', () => guard(setColor)),
  );

  if (enabled()) {
    detectInitProfile().finally(refresh);
  } else {
    refresh();
  }
}

async function onEnabledChanged(): Promise<void> {
  if (enabled()) {
    await detectInitProfile();
  }
  await refresh();
}

/**
 * Saat plugin aktif: baca identity git yang dipakai terminal di project ini,
 * lalu simpan sebagai profile 'init' jika belum ada profile dengan name + email yang sama.
 */
async function detectInitProfile(): Promise<void> {
  try {
    const root = await currentRepo();
    if (!root) {
      return;
    }
    const identity = await getIdentity(root);
    const result = registerInitProfile(profiles(), identity, path.basename(root));
    if (result.created && result.active) {
      await saveProfiles(result.profiles);
      const { alias, name, email } = result.active;
      vscode.window.showInformationMessage(t().initSaved(alias, name, email));
    } else if (!result.active) {
      vscode.window.showWarningMessage(t().noIdentity());
    }
  } catch (err) {
    vscode.window.showErrorMessage(t().failed((err as Error).message));
  }
}

async function switchProfile(root: string): Promise<void> {
  const list = profiles();
  const active = findByIdentity(list, await getIdentity(root));
  type Item = vscode.QuickPickItem & { profile?: Profile };
  const items: Item[] = list.map((p) => ({
    label: `$(account) ${p.alias}`,
    description: [p.name, p.color, p === active ? t().current() : undefined].filter(Boolean).join(' · '),
    detail: p.email,
    profile: p,
  }));
  items.push({ label: t().addNew() });

  const picked = await vscode.window.showQuickPick(items, { placeHolder: t().switchPlaceholder() });
  if (!picked) {
    return;
  }
  if (!picked.profile) {
    await addProfile(root);
    return;
  }
  if (picked.profile !== active) {
    await applyProfile(root, picked.profile);
  }
}

async function addProfile(root: string): Promise<void> {
  const profile = await promptProfile();
  if (!profile) {
    return;
  }
  await saveProfiles([...profiles(), profile]);
  const choice = await vscode.window.showInformationMessage(t().added(profile.alias), t().switchNow());
  if (choice === t().switchNow()) {
    await applyProfile(root, profile);
  }
}

async function editProfile(root: string): Promise<void> {
  const original = await pickProfile(t().pickEditPlaceholder());
  if (!original) {
    return;
  }
  const updated = await promptProfile(original);
  if (!updated) {
    return;
  }
  // Jika profile yang diedit sedang dipakai di project ini, terapkan perubahan name/email-nya juga.
  const wasActive = findByIdentity([original], await getIdentity(root)) !== undefined;
  await saveProfiles(replaceProfile(profiles(), original.alias, updated));
  if (wasActive) {
    await setIdentity(root, updated);
  }
  vscode.window.showInformationMessage(t().updated(updated.alias));
  await refresh();
}

async function deleteProfile(): Promise<void> {
  const target = await pickProfile(t().pickDeletePlaceholder());
  if (!target) {
    return;
  }
  const answer = await vscode.window.showWarningMessage(t().confirmDelete(target.alias), t().yes(), t().no());
  if (answer !== t().yes()) {
    return;
  }
  await saveProfiles(removeProfile(profiles(), target.alias));
  vscode.window.showInformationMessage(t().deleted(target.alias));
}

/** Ganti warna saja, tanpa melewati input alias/name/email. */
async function setColor(): Promise<void> {
  const target = await pickProfile(t().pickColorPlaceholder());
  if (!target) {
    return;
  }
  const color = await pickColor(target.color);
  if (color === undefined) {
    return;
  }
  const updated = normalize({ ...target, color });
  await saveProfiles(replaceProfile(profiles(), target.alias, updated));
  vscode.window.showInformationMessage(t().updated(updated.alias));
}

/** Pilih warna dari preset, tanpa warna, atau hex custom. Return '' = tanpa warna, undefined = batal. */
async function pickColor(current?: string): Promise<string | undefined> {
  type Item = vscode.QuickPickItem & { hex?: string };
  const mark = (hex: string) => (hex === (current ?? '') ? t().current() : undefined);
  const presetHex: string[] = PRESET_COLORS.map((c) => c.hex);
  const items: Item[] = [
    { label: `$(circle-slash) ${t().colorNone()}`, description: mark(''), hex: '' },
    ...PRESET_COLORS.map((c) => ({
      label: `$(circle-filled) ${t().colorNames[c.key]}`,
      description: [c.hex, mark(c.hex)].filter(Boolean).join(' · '),
      hex: c.hex,
    })),
    {
      label: t().colorCustom(),
      description: current && !presetHex.includes(current) ? `${current} · ${t().current()}` : undefined,
    },
  ];
  const picked = await vscode.window.showQuickPick(items, { placeHolder: t().colorPlaceholder() });
  if (!picked) {
    return undefined;
  }
  if (picked.hex !== undefined) {
    return picked.hex;
  }
  return vscode.window.showInputBox({
    prompt: t().colorHexPrompt(),
    value: current ?? '#',
    validateInput: (v) => (isValidColor(v) ? undefined : t().colorInvalid()),
  });
}

async function applyProfile(root: string, profile: Profile): Promise<void> {
  await setIdentity(root, profile);
  vscode.window.showInformationMessage(t().switched(profile.alias, path.basename(root)));
  await refresh();
}

async function pickProfile(placeHolder: string): Promise<Profile | undefined> {
  const list = profiles();
  if (list.length === 0) {
    vscode.window.showWarningMessage(t().noProfiles());
    return undefined;
  }
  const picked = await vscode.window.showQuickPick(
    list.map((p) => ({ label: p.alias, description: p.name, detail: p.email, profile: p })),
    { placeHolder },
  );
  return picked?.profile;
}

/** Minta alias, name, email lewat input box. `initial` diisi saat edit. */
async function promptProfile(initial?: Profile): Promise<Profile | undefined> {
  const list = profiles();
  const check = (draft: Profile, field: 'alias' | 'name' | 'email' | 'color') => {
    const error = validateProfile(list, normalize(draft), initial?.alias);
    const fieldOf = { aliasRequired: 'alias', aliasTaken: 'alias', nameRequired: 'name', emailInvalid: 'email', colorInvalid: 'color' } as const;
    return error && fieldOf[error] === field ? t()[error]() : undefined;
  };
  const draft: Profile = { alias: '', name: '', email: '', ...initial };

  const alias = await vscode.window.showInputBox({
    prompt: t().aliasPrompt(),
    value: draft.alias,
    validateInput: (v) => check({ ...draft, alias: v }, 'alias'),
  });
  if (alias === undefined) {
    return undefined;
  }
  draft.alias = alias;
  const name = await vscode.window.showInputBox({
    prompt: t().namePrompt(),
    value: draft.name,
    validateInput: (v) => check({ ...draft, name: v }, 'name'),
  });
  if (name === undefined) {
    return undefined;
  }
  draft.name = name;
  const email = await vscode.window.showInputBox({
    prompt: t().emailPrompt(),
    value: draft.email,
    validateInput: (v) => check({ ...draft, email: v }, 'email'),
  });
  if (email === undefined) {
    return undefined;
  }
  draft.email = email;
  const color = await pickColor(initial?.color);
  if (color === undefined) {
    return undefined;
  }
  draft.color = color;
  return normalize(draft);
}

/** Jalankan command hanya jika plugin aktif dan workspace adalah repo git. */
async function guard(fn: (root: string) => Promise<void>): Promise<void> {
  if (!enabled()) {
    vscode.window.showWarningMessage(t().notEnabled());
    return;
  }
  try {
    const root = await currentRepo();
    if (!root) {
      vscode.window.showWarningMessage(t().noRepo());
      return;
    }
    await fn(root);
  } catch (err) {
    vscode.window.showErrorMessage(t().failed((err as Error).message));
  }
}

/** Update teks status bar sesuai identity git project yang sedang aktif. */
async function refresh(): Promise<void> {
  if (!enabled()) {
    statusBar.hide();
    watchConfig(undefined);
    return;
  }
  let root: string | undefined;
  try {
    root = await currentRepo();
  } catch {
    root = undefined; // git tidak tersedia
  }
  watchConfig(root);
  if (!root) {
    statusBar.hide();
    return;
  }
  const project = path.basename(root);
  const identity = await getIdentity(root).catch(() => ({ name: undefined, email: undefined }));
  const active = findByIdentity(profiles(), identity);
  if (active) {
    statusBar.text = `$(account) ${active.alias}`;
    statusBar.tooltip = t().tooltipActive(active.alias, active.name, active.email, project);
    statusBar.backgroundColor = undefined;
    statusBar.color = active.color;
  } else if (identity.name && identity.email) {
    statusBar.text = `$(account) ${t().statusUnknown()}`;
    statusBar.tooltip = t().tooltipUnknown(identity.name, identity.email, project);
    statusBar.color = undefined;
    statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  } else {
    statusBar.text = `$(account) ${t().statusNone()}`;
    statusBar.tooltip = t().tooltipNone(project);
    statusBar.color = undefined;
    statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  }
  statusBar.show();
}

/** Pantau .git/config repo aktif supaya `git config user.*` dari terminal langsung tampil di status bar. */
function watchConfig(root: string | undefined): void {
  if (root === watchedRoot) {
    return;
  }
  configWatcher?.dispose();
  configWatcher = undefined;
  watchedRoot = root;
  if (root) {
    configWatcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(root, '.git/config'));
    configWatcher.onDidChange(() => refresh());
    configWatcher.onDidCreate(() => refresh());
  }
}

/** Repo git dari file yang sedang dibuka, atau folder workspace pertama. */
async function currentRepo(): Promise<string | undefined> {
  const uri = vscode.window.activeTextEditor?.document.uri;
  const folder =
    (uri && uri.scheme === 'file' && vscode.workspace.getWorkspaceFolder(uri)) || vscode.workspace.workspaceFolders?.[0];
  return folder ? repoRoot(folder.uri.fsPath) : undefined;
}

function profiles(): Profile[] {
  return config().get<Profile[]>('profiles', []);
}

function saveProfiles(list: Profile[]): Thenable<void> {
  // Profile dipakai lintas project, jadi disimpan di user settings.
  return config().update('profiles', list, vscode.ConfigurationTarget.Global);
}

function enabled(): boolean {
  return config().get<boolean>('enabled', false);
}

function config() {
  return vscode.workspace.getConfiguration('gitProfileSwitcher');
}

function currentLang(): Lang {
  return resolveLang(config().get<string>('language'), vscode.env.language);
}

function t() {
  return messages(currentLang());
}

export function deactivate(): void {}
