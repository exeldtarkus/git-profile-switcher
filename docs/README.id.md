# Git Profile Switcher

🇬🇧 [English](../README.md) | 🇮🇩 Bahasa Indonesia

Extension VS Code untuk mengganti git profile (`user.name` + `user.email`) per project, dengan profile aktif tampil di status bar.

## Fitur

- **Aktivasi per workspace**: jalankan `Git Profile Switcher: Aktivasi` lalu pilih `true`.
- **Deteksi otomatis**: saat aktif, extension membaca identity git yang dipakai terminal di project ini (`git config user.name` / `user.email`). Jika belum ada di daftar profile, identity itu disimpan sebagai profile dengan alias **`init`** (atau `init-<nama-project>` jika `init` sudah dipakai identity lain).
- **Tambah profile**: isi alias, username, dan email.
- **Edit profile**: ubah alias, username, email, atau warna. Jika profile itu sedang dipakai di project ini, git config project ikut diperbarui.
- **Hapus profile**: minta konfirmasi dulu. Git config project Anda tidak diubah.
- **Warna profile**: setiap profile bisa punya warna teks/ikon status bar sendiri (preset atau hex custom seperti `#ff8800`). Diatur saat tambah/edit profile, atau lewat `Git Profile Switcher: Atur warna profile`.
- **Ganti profile**: klik item status bar (👤 `<alias>`) atau jalankan `Git Profile Switcher: Ganti profile`. Identity ditulis dengan `git config --local`, jadi hanya berlaku untuk project ini.
- **Status bar**: menampilkan alias profile aktif. Berwarna kuning jika identity project bukan profile tersimpan atau belum di-set. Ikut berubah saat `git config` diubah dari terminal.
- **Bahasa notifikasi**: English atau Bahasa Indonesia (`Git Profile Switcher: Bahasa`).

## Command

| Command | Keterangan |
| --- | --- |
| `Git Profile Switcher: Aktivasi` | Aktifkan/nonaktifkan extension untuk workspace ini |
| `Git Profile Switcher: Ganti profile` | Pilih profile git untuk project ini |
| `Git Profile Switcher: Tambah profile` | Tambah profile baru |
| `Git Profile Switcher: Edit profile` | Edit profile yang sudah ada |
| `Git Profile Switcher: Atur warna profile` | Ubah warna profile saja |
| `Git Profile Switcher: Hapus profile` | Hapus profile |
| `Git Profile Switcher: Bahasa` | Ganti bahasa notifikasi |

Nama command mengikuti bahasa tampilan VS Code (English atau Bahasa Indonesia).

## Lokasi penyimpanan data

| Data | Lokasi |
| --- | --- |
| Daftar profile | User settings `gitProfileSwitcher.profiles`, dipakai di semua project dan bisa diedit manual di `settings.json` |
| Status aktif | Workspace settings `gitProfileSwitcher.enabled` (`.vscode/settings.json`) |
| Identity project | `.git/config` project (`git config --local`) |

`~/.gitconfig` global Anda tidak pernah diubah.

Contoh daftar profile:

```json
"gitProfileSwitcher.profiles": [
  { "alias": "init", "name": "Exel", "email": "exel@personal.com" },
  { "alias": "kantor", "name": "Exel", "email": "exel@company.com", "color": "#3b8eea" }
]
```

## Development

```bash
npm install
npm test              # compile + unit test
npm run package       # build .vsix
npm run install:local # build + install ke VS Code lokal
```

Tekan `F5` di VS Code untuk menjalankan Extension Development Host.
