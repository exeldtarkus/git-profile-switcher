import { test } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';

const root = path.join(__dirname, '..', '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const nls = JSON.parse(fs.readFileSync(path.join(root, 'package.nls.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'src', 'extension.ts'), 'utf8');
const commands: { command: string; title: string }[] = pkg.contributes.commands;
const palette: { command: string; when: string }[] = pkg.contributes.menus.commandPalette;

test('setiap command English punya kembaran Bahasa Indonesia', () => {
  const english = commands.filter((c) => !c.command.startsWith('gitProfileSwitcher.id.'));
  for (const c of english) {
    const name = c.command.split('.').pop();
    assert.ok(commands.some((x) => x.command === `gitProfileSwitcher.id.${name}`), `kembaran untuk ${c.command}`);
    assert.ok(source.includes(`'${name}'`), `${name} ada di LOCALIZED_COMMANDS`);
  }
});

test('Command Palette: English saat lang != id, Indonesia saat lang == id', () => {
  for (const c of commands) {
    const entry = palette.find((m) => m.command === c.command);
    assert.ok(entry, `menu untuk ${c.command}`);
    const isId = c.command.startsWith('gitProfileSwitcher.id.');
    assert.ok(entry.when.includes(isId ? "gitProfileSwitcher.lang == 'id'" : "gitProfileSwitcher.lang != 'id'"), c.command);
  }
});

test('semua judul command ada di package.nls.json', () => {
  for (const c of commands) {
    const key = c.title.replace(/^%|%$/g, '');
    assert.ok(nls[key], `judul ${key}`);
  }
});
