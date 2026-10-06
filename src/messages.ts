export type Lang = 'en' | 'id';

const en = {
  current: () => 'current',
  activationPlaceholder: () => 'Enable Git Profile Switcher in this workspace?',
  enabled: () => 'Git Profile Switcher enabled for this workspace.',
  disabled: () => 'Git Profile Switcher disabled for this workspace.',
  notEnabled: () => "Git Profile Switcher is not active in this workspace. Run 'Git Profile Switcher: Activation' first.",
  languagePlaceholder: () => 'Choose the language for Git Profile Switcher notifications',
  languageChanged: () => 'Git Profile Switcher language set to English.',
  noRepo: () => 'No git repository found in this workspace.',
  noIdentity: () => 'No git user.name / user.email is set for this project yet. Add a profile and switch to it.',
  initSaved: (alias: string, name: string, email: string) => `Current git identity saved as profile '${alias}' (${name} <${email}>).`,
  switchPlaceholder: () => 'Choose the git profile for this project',
  addNew: () => '$(add) Add new profile…',
  noProfiles: () => 'No profiles saved yet.',
  pickEditPlaceholder: () => 'Choose a profile to edit',
  pickDeletePlaceholder: () => 'Choose a profile to delete',
  pickColorPlaceholder: () => 'Choose a profile to set its color',
  aliasPrompt: () => 'Profile alias (e.g. work, personal)',
  namePrompt: () => 'Git user.name',
  emailPrompt: () => 'Git user.email',
  aliasRequired: () => 'Alias is required.',
  aliasTaken: () => 'That alias is already used by another profile.',
  nameRequired: () => 'Name is required.',
  emailInvalid: () => 'Enter a valid email address.',
  colorPlaceholder: () => 'Status bar color for this profile',
  colorNone: () => 'No color (follow theme)',
  colorCustom: () => '$(edit) Custom hex color…',
  colorHexPrompt: () => 'Hex color, e.g. #ff8800',
  colorInvalid: () => 'Enter a hex color like #f80 or #ff8800.',
  colorNames: {
    red: 'Red',
    orange: 'Orange',
    yellow: 'Yellow',
    green: 'Green',
    cyan: 'Cyan',
    blue: 'Blue',
    purple: 'Purple',
    pink: 'Pink',
  } as Record<string, string>,
  added: (alias: string) => `Profile '${alias}' added.`,
  updated: (alias: string) => `Profile '${alias}' updated.`,
  deleted: (alias: string) => `Profile '${alias}' deleted.`,
  switched: (alias: string, project: string) => `Git profile for '${project}' switched to '${alias}'.`,
  switchNow: () => 'Use in this project',
  confirmDelete: (alias: string) => `Delete profile '${alias}'? The git config of your projects is not changed.`,
  yes: () => 'Yes',
  no: () => 'No',
  failed: (error: string) => `Git Profile Switcher failed: ${error}`,
  statusUnknown: () => 'unknown',
  statusNone: () => 'no profile',
  tooltipActive: (alias: string, name: string, email: string, project: string) =>
    `Git profile '${alias}' for ${project}\n${name} <${email}>\nClick to switch`,
  tooltipUnknown: (name: string, email: string, project: string) =>
    `Git identity for ${project} is not a saved profile\n${name} <${email}>\nClick to switch`,
  tooltipNone: (project: string) => `No git identity set for ${project}\nClick to choose a profile`,
};

const id: typeof en = {
  current: () => 'saat ini',
  activationPlaceholder: () => 'Aktifkan Git Profile Switcher di workspace ini?',
  enabled: () => 'Git Profile Switcher diaktifkan untuk workspace ini.',
  disabled: () => 'Git Profile Switcher dinonaktifkan untuk workspace ini.',
  notEnabled: () => "Git Profile Switcher belum aktif di workspace ini. Jalankan 'Git Profile Switcher: Aktivasi' terlebih dahulu.",
  languagePlaceholder: () => 'Pilih bahasa untuk notifikasi Git Profile Switcher',
  languageChanged: () => 'Bahasa Git Profile Switcher diubah ke Bahasa Indonesia.',
  noRepo: () => 'Tidak ada repository git di workspace ini.',
  noIdentity: () => 'Project ini belum punya git user.name / user.email. Tambah profile lalu pilih profile tersebut.',
  initSaved: (alias, name, email) => `Identity git saat ini disimpan sebagai profile '${alias}' (${name} <${email}>).`,
  switchPlaceholder: () => 'Pilih profile git untuk project ini',
  addNew: () => '$(add) Tambah profile baru…',
  noProfiles: () => 'Belum ada profile tersimpan.',
  pickEditPlaceholder: () => 'Pilih profile yang akan diedit',
  pickDeletePlaceholder: () => 'Pilih profile yang akan dihapus',
  pickColorPlaceholder: () => 'Pilih profile yang akan diatur warnanya',
  aliasPrompt: () => 'Alias profile (mis. kantor, pribadi)',
  namePrompt: () => 'Git user.name',
  emailPrompt: () => 'Git user.email',
  aliasRequired: () => 'Alias wajib diisi.',
  aliasTaken: () => 'Alias sudah dipakai profile lain.',
  nameRequired: () => 'Nama wajib diisi.',
  emailInvalid: () => 'Masukkan alamat email yang valid.',
  colorPlaceholder: () => 'Warna status bar untuk profile ini',
  colorNone: () => 'Tanpa warna (ikut tema)',
  colorCustom: () => '$(edit) Warna hex custom…',
  colorHexPrompt: () => 'Warna hex, mis. #ff8800',
  colorInvalid: () => 'Masukkan warna hex seperti #f80 atau #ff8800.',
  colorNames: {
    red: 'Merah',
    orange: 'Oranye',
    yellow: 'Kuning',
    green: 'Hijau',
    cyan: 'Cyan',
    blue: 'Biru',
    purple: 'Ungu',
    pink: 'Pink',
  },
  added: (alias) => `Profile '${alias}' ditambahkan.`,
  updated: (alias) => `Profile '${alias}' diperbarui.`,
  deleted: (alias) => `Profile '${alias}' dihapus.`,
  switched: (alias, project) => `Profile git untuk '${project}' diganti ke '${alias}'.`,
  switchNow: () => 'Pakai di project ini',
  confirmDelete: (alias) => `Hapus profile '${alias}'? Git config project Anda tidak diubah.`,
  yes: () => 'Ya',
  no: () => 'Tidak',
  failed: (error) => `Git Profile Switcher gagal: ${error}`,
  statusUnknown: () => 'tidak dikenal',
  statusNone: () => 'tanpa profile',
  tooltipActive: (alias, name, email, project) =>
    `Profile git '${alias}' untuk ${project}\n${name} <${email}>\nKlik untuk ganti`,
  tooltipUnknown: (name, email, project) =>
    `Identity git untuk ${project} bukan profile tersimpan\n${name} <${email}>\nKlik untuk ganti`,
  tooltipNone: (project) => `${project} belum punya identity git\nKlik untuk memilih profile`,
};

export type Messages = typeof en;

/** `setting` = nilai gitProfileSwitcher.language; `displayLanguage` = vscode.env.language. */
export function resolveLang(setting: string | undefined, displayLanguage: string): Lang {
  if (setting === 'en' || setting === 'id') {
    return setting;
  }
  return displayLanguage.toLowerCase().startsWith('id') ? 'id' : 'en';
}

export function messages(lang: Lang): Messages {
  return lang === 'id' ? id : en;
}
