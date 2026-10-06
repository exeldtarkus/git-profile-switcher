import { test } from 'node:test';
import * as assert from 'node:assert';
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { getIdentity, repoRoot, setIdentity } from '../git';

function setupRepo(): string {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'git-profile-')));
  execFileSync('git', ['init', '-q'], { cwd: root });
  return root;
}

test('repoRoot: root repo dari subfolder, undefined di luar repo', async () => {
  const root = setupRepo();
  fs.mkdirSync(path.join(root, 'sub'));
  assert.strictEqual(await repoRoot(path.join(root, 'sub')), root);
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'no-git-'));
  process.env.GIT_CEILING_DIRECTORIES = path.dirname(outside);
  try {
    assert.strictEqual(await repoRoot(outside), undefined);
  } finally {
    delete process.env.GIT_CEILING_DIRECTORIES;
  }
});

test('setIdentity menulis ke config local dan terbaca oleh getIdentity', async () => {
  const root = setupRepo();
  await setIdentity(root, { name: 'Tester', email: 'tester@example.com' });
  assert.deepStrictEqual(await getIdentity(root), { name: 'Tester', email: 'tester@example.com' });
  const local = execFileSync('git', ['config', '--local', 'user.email'], { cwd: root, encoding: 'utf8' }).trim();
  assert.strictEqual(local, 'tester@example.com');
});
