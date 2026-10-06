export const INIT_ALIAS = 'init';

export interface Profile {
  alias: string;
  name: string;
  email: string;
  /** Warna teks item status bar saat profile ini aktif, format hex (#rgb / #rrggbb). Opsional. */
  color?: string;
}

export interface Identity {
  name: string | undefined;
  email: string | undefined;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+$/;
const COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Pilihan warna siap pakai; `key` dipakai untuk nama warna di messages. */
export const PRESET_COLORS = [
  { key: 'red', hex: '#f14c4c' },
  { key: 'orange', hex: '#ff8c00' },
  { key: 'yellow', hex: '#e5c07b' },
  { key: 'green', hex: '#23d18b' },
  { key: 'cyan', hex: '#29b8db' },
  { key: 'blue', hex: '#3b8eea' },
  { key: 'purple', hex: '#c678dd' },
  { key: 'pink', hex: '#ff79c6' },
] as const;

export function isValidColor(color: string): boolean {
  return COLOR_RE.test(color.trim());
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

/** Profile yang name + email-nya sama persis dengan identity git saat ini. */
export function findByIdentity(profiles: Profile[], identity: Identity): Profile | undefined {
  return profiles.find((p) => p.name === identity.name && p.email === identity.email);
}

export function findByAlias(profiles: Profile[], alias: string): Profile | undefined {
  const key = alias.trim().toLowerCase();
  return profiles.find((p) => p.alias.toLowerCase() === key);
}

/** Alias unik berbasis `base`: "init", lalu "init-<project>", lalu "init-<project>-2", dst. */
export function uniqueAlias(profiles: Profile[], base: string, project: string): string {
  if (!findByAlias(profiles, base)) {
    return base;
  }
  const withProject = `${base}-${project}`;
  let candidate = withProject;
  for (let i = 2; findByAlias(profiles, candidate); i++) {
    candidate = `${withProject}-${i}`;
  }
  return candidate;
}

/**
 * Dipanggil saat plugin diaktifkan: jika identity git di project belum punya profile,
 * simpan sebagai profile baru dengan alias default 'init'. Return list baru + profile yang aktif.
 */
export function registerInitProfile(
  profiles: Profile[],
  identity: Identity,
  project: string,
): { profiles: Profile[]; active: Profile | undefined; created: boolean } {
  if (!identity.name || !identity.email) {
    return { profiles, active: undefined, created: false };
  }
  const existing = findByIdentity(profiles, identity);
  if (existing) {
    return { profiles, active: existing, created: false };
  }
  const profile: Profile = { alias: uniqueAlias(profiles, INIT_ALIAS, project), name: identity.name, email: identity.email };
  return { profiles: [...profiles, profile], active: profile, created: true };
}

/**
 * Validasi input profile. `originalAlias` diisi saat edit supaya alias milik profile itu sendiri
 * tidak dianggap duplikat. Return pesan error (key) atau undefined jika valid.
 */
export function validateProfile(
  profiles: Profile[],
  profile: Profile,
  originalAlias?: string,
): 'aliasRequired' | 'aliasTaken' | 'nameRequired' | 'emailInvalid' | 'colorInvalid' | undefined {
  if (!profile.alias.trim()) {
    return 'aliasRequired';
  }
  const clash = findByAlias(profiles, profile.alias);
  if (clash && clash.alias.toLowerCase() !== originalAlias?.toLowerCase()) {
    return 'aliasTaken';
  }
  if (!profile.name.trim()) {
    return 'nameRequired';
  }
  if (!isValidEmail(profile.email)) {
    return 'emailInvalid';
  }
  if (profile.color && !isValidColor(profile.color)) {
    return 'colorInvalid';
  }
  return undefined;
}

/** Ganti profile beralias `originalAlias` dengan `updated`, urutan tetap. */
export function replaceProfile(profiles: Profile[], originalAlias: string, updated: Profile): Profile[] {
  const key = originalAlias.toLowerCase();
  return profiles.map((p) => (p.alias.toLowerCase() === key ? updated : p));
}

export function removeProfile(profiles: Profile[], alias: string): Profile[] {
  const key = alias.toLowerCase();
  return profiles.filter((p) => p.alias.toLowerCase() !== key);
}

export function normalize(profile: Profile): Profile {
  const result: Profile = { alias: profile.alias.trim(), name: profile.name.trim(), email: profile.email.trim() };
  const color = profile.color?.trim().toLowerCase();
  if (color) {
    result.color = color; // tanpa warna: key tidak ditulis ke settings.json
  }
  return result;
}
