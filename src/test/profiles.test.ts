import { test } from 'node:test';
import * as assert from 'node:assert';
import {
  Profile,
  findByIdentity,
  normalize,
  registerInitProfile,
  removeProfile,
  replaceProfile,
  uniqueAlias,
  validateProfile,
} from '../profiles';

const work: Profile = { alias: 'work', name: 'Exel', email: 'exel@company.com' };
const init: Profile = { alias: 'init', name: 'Exel', email: 'exel@gmail.com' };

test('registerInitProfile: identity baru disimpan dengan alias init', () => {
  const result = registerInitProfile([work], { name: 'Exel', email: 'exel@gmail.com' }, 'proj');
  assert.strictEqual(result.created, true);
  assert.deepStrictEqual(result.active, init);
  assert.deepStrictEqual(result.profiles, [work, init]);
});

test('registerInitProfile: identity yang sudah ada tidak diduplikasi', () => {
  const result = registerInitProfile([work], { name: 'Exel', email: 'exel@company.com' }, 'proj');
  assert.strictEqual(result.created, false);
  assert.strictEqual(result.active, work);
  assert.deepStrictEqual(result.profiles, [work]);
});

test('registerInitProfile: alias init sudah dipakai identity lain -> init-<project>', () => {
  const result = registerInitProfile([init], { name: 'Other', email: 'o@x.com' }, 'proj');
  assert.strictEqual(result.active?.alias, 'init-proj');
});

test('registerInitProfile: identity kosong tidak membuat profile', () => {
  const result = registerInitProfile([], { name: 'Exel', email: undefined }, 'proj');
  assert.deepStrictEqual(result, { profiles: [], active: undefined, created: false });
});

test('uniqueAlias menambah nomor saat init-<project> juga dipakai', () => {
  const list = [init, { ...work, alias: 'init-proj' }];
  assert.strictEqual(uniqueAlias(list, 'init', 'proj'), 'init-proj-2');
});

test('findByIdentity mencocokkan name dan email', () => {
  assert.strictEqual(findByIdentity([work, init], { name: 'Exel', email: 'exel@gmail.com' }), init);
  assert.strictEqual(findByIdentity([work, init], { name: 'Other', email: 'exel@gmail.com' }), undefined);
});

test('validateProfile', () => {
  const list = [work, init];
  assert.strictEqual(validateProfile(list, { alias: ' ', name: 'a', email: 'a@b.c' }), 'aliasRequired');
  assert.strictEqual(validateProfile(list, { alias: 'WORK', name: 'a', email: 'a@b.c' }), 'aliasTaken');
  assert.strictEqual(validateProfile(list, { alias: 'work', name: 'a', email: 'a@b.c' }, 'work'), undefined);
  assert.strictEqual(validateProfile(list, { alias: 'x', name: '', email: 'a@b.c' }), 'nameRequired');
  assert.strictEqual(validateProfile(list, { alias: 'x', name: 'a', email: 'not-email' }), 'emailInvalid');
  assert.strictEqual(validateProfile(list, { alias: 'x', name: 'a', email: 'a@b.c' }), undefined);
});

test('replaceProfile dan removeProfile', () => {
  const edited = { ...work, alias: 'office' };
  assert.deepStrictEqual(replaceProfile([work, init], 'work', edited), [edited, init]);
  assert.deepStrictEqual(removeProfile([work, init], 'WORK'), [init]);
});

test('validateProfile: warna opsional, harus hex jika diisi', () => {
  const base = { alias: 'x', name: 'a', email: 'a@b.c' };
  assert.strictEqual(validateProfile([], { ...base, color: '' }), undefined);
  assert.strictEqual(validateProfile([], { ...base, color: '#F80' }), undefined);
  assert.strictEqual(validateProfile([], { ...base, color: '#ff8800' }), undefined);
  assert.strictEqual(validateProfile([], { ...base, color: 'red' }), 'colorInvalid');
  assert.strictEqual(validateProfile([], { ...base, color: '#ff88' }), 'colorInvalid');
});

test('normalize: warna di-lowercase, warna kosong dihapus dari object', () => {
  assert.deepStrictEqual(normalize({ ...work, color: ' #FF8800 ' }), { ...work, color: '#ff8800' });
  assert.deepStrictEqual(normalize({ ...work, color: '' }), work);
  assert.ok(!('color' in normalize({ ...work, color: '' })));
});
