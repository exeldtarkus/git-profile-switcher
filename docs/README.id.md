# Git Profile Switcher

🇬🇧 [English](../README.md) | 🇮🇩 Bahasa Indonesia

Extension VS Code untuk mengganti git profile (`user.name` + `user.email`) per project, dengan profile aktif tampil di status bar.

## Fitur

- **Aktivasi global**: jalankan `Git Profile Switcher: Activation` (atau `Aktivasi`) sekali lalu pilih *Aktifkan*. Berlaku di semua project yang dibuka di VS Code dengan extension ini terpasang.
- **Deteksi otomatis**: saat aktif, extension membaca identity git yang dipakai terminal di project ini (`git config user.name` / `user.email`). Jika belum ada di daftar profile, identity itu disimpan sebagai profile dengan alias **`init`** (atau `init-<nama-project>` jika `init` sudah dipakai identity lain).
- **Tambah profile**: isi alias, username, dan email.
- **Edit profile**: ubah alias, username, email, atau warna. Jika profile itu sedang dipakai di project ini, git config project ikut diperbarui.
- **Hapus profile**: minta konfirmasi dulu. Git config project Anda tidak diubah.
- **Warna profile**: setiap profile bisa punya warna teks/ikon status bar sendiri (preset atau hex custom seperti `#ff8800`). Diatur saat tambah/edit profile, atau lewat `Git Profile Switcher: Set profile color`.
- **Icon profile**: setiap profile bisa punya icon status bar sendiri, dipilih dari preset (briefcase, home, rocket, …) atau nama [codicon](https://code.visualstudio.com/api/references/icons-in-labels#icon-listing) apa pun seperti `coffee` atau `sync~spin`. Diatur saat tambah/edit profile, atau lewat `Git Profile Switcher: Set profile icon`.
- **Buka settings JSON**: membuka `settings.json` user tepat di daftar profile, untuk edit profile secara manual.
- **Reset**: menghapus semua profile tersimpan (dipakai bersama oleh semua project) lalu membuat ulang satu profile dengan alias **`init`** dari identity git yang sedang aktif di terminal untuk project ini. Ada konfirmasi terlebih dahulu.
- **Ganti profile**: klik item status bar (di menunya juga ada *Tambah*, *Buka settings JSON*, dan *Reset*) (mis. 💼 `kantor - Git Profile`) atau jalankan `Git Profile Switcher: Switch profile`. Identity ditulis dengan `git config --local`, jadi hanya berlaku untuk project ini.
- **Status bar**: menampilkan alias profile aktif. Berwarna kuning jika identity project bukan profile tersimpan atau belum di-set. Ikut berubah saat `git config` diubah dari terminal.
- **Bahasa notifikasi**: default English, bisa diganti ke Bahasa Indonesia lewat `Git Profile Switcher: Language`. Nama command di Command Palette ikut berganti bahasa (mis. `Switch profile` ↔ `Ganti profile`).

## Command

| Command | Keterangan |
| --- | --- |
| `Git Profile Switcher: Activation` | Aktifkan/nonaktifkan extension untuk semua project |
| `Git Profile Switcher: Switch profile` | Pilih profile git untuk project ini |
| `Git Profile Switcher: Add profile` | Tambah profile baru |
| `Git Profile Switcher: Edit profile` | Edit profile yang sudah ada |
| `Git Profile Switcher: Set profile color` | Ubah warna profile saja |
| `Git Profile Switcher: Set profile icon` | Ubah icon profile saja |
| `Git Profile Switcher: Delete profile` | Hapus profile |
| `Git Profile Switcher: Open settings JSON` | Buka daftar profile di `settings.json` user |
| `Git Profile Switcher: Reset` | Hapus semua profile dan buat ulang `init` dari identity git saat ini |
| `Git Profile Switcher: Language` | Ganti bahasa notifikasi |

Tabel di atas memakai nama command English (default). Jika bahasa diganti ke Bahasa Indonesia, nama command ikut berubah: `Aktivasi`, `Ganti profile`, `Tambah profile`, `Edit profile`, `Atur warna profile`, `Atur icon profile`, `Hapus profile`, `Buka settings JSON`, `Reset`, `Bahasa`.

## Lokasi penyimpanan data

| Data | Lokasi |
| --- | --- |
| Daftar profile | User settings `gitProfileSwitcher.profiles`, dipakai di semua project dan bisa diedit manual di `settings.json` |
| Status aktif | User settings `gitProfileSwitcher.enabled`, berlaku di semua project |
| Identity project | `.git/config` project (`git config --local`) |

Daftar profile dan status aktif disimpan di user settings, jadi cukup di-set sekali dan langsung tersedia di semua project, selama extension ini terpasang. Jika Settings Sync aktif, keduanya juga ikut ke komputer lain. Untuk menonaktifkan extension di satu project saja, tambahkan `"gitProfileSwitcher.enabled": false` di `.vscode/settings.json` project tersebut.

`~/.gitconfig` global Anda tidak pernah diubah.

Contoh daftar profile:

```json
"gitProfileSwitcher.profiles": [
  { "alias": "init", "name": "Exel", "email": "exel@personal.com" },
  { "alias": "kantor", "name": "Exel", "email": "exel@company.com", "color": "#3b8eea", "icon": "briefcase" }
]
```

## Development

```bash
npm install
npm test              # compile + unit test
npm run package       # build .vsix
npm run install:local # build + install ke VS Code lokal
npm run deploy        # publish ke Open VSX
```

Tekan `F5` di VS Code untuk menjalankan Extension Development Host.

Untuk publish ke Open VSX: `npm run deploy`. Lihat [DEVELOPMENT.id.md](DEVELOPMENT.id.md) untuk detail setup dan publish.
