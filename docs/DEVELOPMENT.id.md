# Development & Publishing

🇬🇧 [English](DEVELOPMENT.md) | 🇮🇩 Bahasa Indonesia

Panduan untuk menjalankan extension ini secara lokal dan mempublikasikannya ke [Open VSX Registry](https://open-vsx.org/).

## Prasyarat

- Node.js 20+ dan npm
- VS Code (atau editor yang kompatibel seperti VSCodium/Cursor)
- Git

---

## Menjalankan secara lokal

### 1. Clone & install dependency

```bash
git clone https://github.com/exeldtarkus/git-profile-switcher.git
cd git-profile-switcher
npm install
```

### 2. Compile

```bash
npm run compile   # compile sekali
npm run watch     # compile otomatis setiap file berubah
```

Hasil compile ada di folder `out/`.

### 3. Jalankan unit test

```bash
npm test
```

### 4. Debug dengan Extension Development Host (F5)

1. Buka folder `git-profile-switcher` di VS Code.
2. Tekan **F5** (atau menu **Run → Start Debugging**, konfigurasi *Run Extension*).
3. Jendela baru **Extension Development Host** akan terbuka dengan extension ini aktif.
4. Di jendela tersebut, buka project uji (lihat langkah berikut), lalu coba ganti profile.
5. Breakpoint di `src/*.ts` bisa dipakai langsung. Setelah mengubah kode, tekan `Ctrl+Shift+F5` untuk restart.

### 5. Membuat project uji

```bash
mkdir -p ~/git-profile-test && cd ~/git-profile-test
git init
git config --local user.name "Test User"
git config --local user.email "test@example.com"
mkdir -p .vscode && echo '{ "gitProfileSwitcher.enabled": true }' > .vscode/settings.json
```

Skenario uji di jendela Extension Development Host:

1. Buka `~/git-profile-test`: muncul popup bahwa identity saat ini disimpan sebagai profile `init`, dan status bar menampilkan 👤 `init`.
2. Jalankan `Git Profile Switcher: Tambah profile` (mis. alias `kantor`, pilih warna) → pilih *Pakai di project ini*.
   Status bar menampilkan 👤 `kantor` dengan warna tersebut.
3. Di terminal:
   ```bash
   git config --local user.email   # email profile 'kantor'
   git config --local user.email lain@example.com
   ```
   Status bar menjadi kuning (👤 tidak dikenal) karena identity itu bukan profile tersimpan.
4. Klik item status bar dan pilih `init` lagi.

### 6. Build & install `.vsix` secara lokal

```bash
npm run package
code --install-extension git-profile-switcher-0.2.1.vsix
```

Uninstall:

```bash
code --uninstall-extension exeltarkus.git-profile-switcher
```

---

## Deploy ke Open VSX (open-vsx.org)

### 1. Persiapan akun (sekali saja)

1. Buat akun **Eclipse Foundation** di <https://accounts.eclipse.org/user/register>.
   Isi field **GitHub Username** dengan username GitHub kamu (`exeldtarkus`).
2. Login ke <https://open-vsx.org> menggunakan **GitHub**.
3. Buka **Settings** (avatar → *Settings*) → **Log in with Eclipse** untuk menghubungkan akun Eclipse.
4. Tanda tangani **Eclipse Foundation Open VSX Publisher Agreement** yang muncul di halaman tersebut.
5. Buka **Settings → Access Tokens** → **Generate New Token**. Simpan token-nya (hanya ditampilkan sekali).

Simpan token sebagai environment variable agar tidak perlu diketik ulang:

```bash
export OVSX_PAT=<token-kamu>
```

### 2. Buat namespace (sekali saja)

Namespace harus sama dengan field `publisher` di `package.json` (saat ini `exeltarkus`):

```bash
npx ovsx create-namespace exeltarkus -p $OVSX_PAT
```

> Opsional: agar namespace ditandai **verified**, ajukan klaim kepemilikan lewat issue di
> <https://github.com/EclipseFdn/open-vsx.org/issues> (template *Claim namespace ownership*).

### 3. Checklist sebelum publish

- [ ] `version` di `package.json` sudah dinaikkan (Open VSX menolak versi yang sudah pernah dipublish):
      `npm version patch` (atau `minor` / `major`) — otomatis membuat commit & tag git.
- [x] Ada file `LICENSE` di root project (sudah ada, MIT).
- [ ] Field `"repository"` di `package.json` diisi URL GitHub, agar link relatif di README valid:
      ```json
      "repository": { "type": "git", "url": "https://github.com/exeldtarkus/git-profile-switcher.git" }
      ```
- [ ] `npm test` lolos.
- [ ] Cek isi paket: `npx vsce ls`.

### 4. Publish

**Paling mudah: `npm run deploy`.** Saat pertama dijalankan, script meminta access token (input tersembunyi) dan
menyimpannya di `deployment/vsx/token` (di-ignore git, tidak ikut ke VSIX). Lalu script berhenti jika versi ini sudah ada
di Open VSX, membuat namespace jika belum ada, memverifikasi token, menjalankan test, build, dan publish.
Pakai `npm run deploy -- --new-token` untuk mengganti token yang expired.

Atau manual:

Publish langsung dari source (otomatis menjalankan `vscode:prepublish` → compile):

```bash
npx ovsx publish -p $OVSX_PAT
```

Atau publish file `.vsix` yang sudah dibuild:

```bash
npm run package
npx ovsx publish git-profile-switcher-0.2.1.vsix -p $OVSX_PAT
```

Setelah berhasil, extension muncul di:
<https://open-vsx.org/extension/exeltarkus/git-profile-switcher>

Biasanya butuh beberapa menit sampai bisa dicari dan diinstall dari VSCodium / editor lain yang memakai Open VSX.

### 5. (Opsional) Publish otomatis via GitHub Actions

Simpan token di GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**
dengan nama `OVSX_PAT`. Lalu buat `.github/workflows/publish.yml`:

```yaml
name: Publish to Open VSX

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - run: npx ovsx publish -p ${{ secrets.OVSX_PAT }}
```

Alur rilis:

```bash
npm version patch       # naikkan versi + buat tag vX.Y.Z
git push --follow-tags  # push commit & tag → workflow publish berjalan
```

---