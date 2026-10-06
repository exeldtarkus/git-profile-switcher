import { execFile } from 'child_process';
import { Identity, Profile } from './profiles';

function git(cwd: string, args: string[]): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd }, (err, stdout) => {
      if (!err) {
        resolve(stdout.trim());
      } else if (typeof err.code === 'number') {
        // `git config` keluar dengan code 1 jika key tidak ada; command lain gagal = bukan repo.
        resolve(undefined);
      } else {
        reject(err); // git tidak terpasang / tidak bisa dijalankan
      }
    });
  });
}

/** Root repo git yang memuat `cwd`, atau undefined jika bukan repo git. */
export function repoRoot(cwd: string): Promise<string | undefined> {
  return git(cwd, ['rev-parse', '--show-toplevel']).then((out) => out || undefined);
}

/**
 * Identity efektif seperti yang dipakai git saat commit dari terminal di folder ini
 * (local > global > system).
 */
export async function getIdentity(cwd: string): Promise<Identity> {
  const [name, email] = await Promise.all([git(cwd, ['config', 'user.name']), git(cwd, ['config', 'user.email'])]);
  return { name: name || undefined, email: email || undefined };
}

/** Tulis ke config local repo, jadi hanya berlaku untuk project ini. */
export async function setIdentity(cwd: string, profile: Pick<Profile, 'name' | 'email'>): Promise<void> {
  for (const [key, value] of [
    ['user.name', profile.name],
    ['user.email', profile.email],
  ]) {
    await new Promise<void>((resolve, reject) => {
      execFile('git', ['config', '--local', key, value], { cwd }, (err, _stdout, stderr) =>
        err ? reject(new Error(stderr.trim() || err.message)) : resolve(),
      );
    });
  }
}
