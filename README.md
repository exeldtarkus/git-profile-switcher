# Git Profile Switcher

🇬🇧 English | 🇮🇩 [Bahasa Indonesia](docs/README.id.md)

A VS Code extension for switching the git profile (`user.name` + `user.email`) per project, with the active profile shown in the status bar.

## Features

- **Per-workspace activation**: run `Git Profile Switcher: Activation` and pick `true`.
- **Automatic detection**: when activated, the extension reads the git identity your terminal uses in this project (`git config user.name` / `user.email`). If it is not in your profile list yet, it is saved as a profile with the alias **`init`** (or `init-<project-name>` if `init` is already used by another identity).
- **Add profile**: enter an alias, username and email.
- **Edit profile**: change the alias, username, email or color. If the profile is in use in this project, the project's git config is updated too.
- **Delete profile**: asks for confirmation. Your projects' git config is not changed.
- **Profile color**: each profile can have its own status bar text/icon color (a preset or a custom hex such as `#ff8800`). Set it while adding/editing a profile, or with `Git Profile Switcher: Set profile color`.
- **Switch profile**: click the status bar item (👤 `<alias>`) or run `Git Profile Switcher: Switch profile`. The identity is written with `git config --local`, so it only applies to this project.
- **Status bar**: shows the alias of the active profile. It turns yellow when the project's identity is not a saved profile or is not set. It also updates when you change `git config` from the terminal.
- **Notification language**: English or Bahasa Indonesia (`Git Profile Switcher: Language`).

## Commands

| Command | Description |
| --- | --- |
| `Git Profile Switcher: Activation` | Enable/disable the extension for this workspace |
| `Git Profile Switcher: Switch profile` | Pick the git profile for this project |
| `Git Profile Switcher: Add profile` | Add a new profile |
| `Git Profile Switcher: Edit profile` | Edit an existing profile |
| `Git Profile Switcher: Set profile color` | Change only a profile's color |
| `Git Profile Switcher: Delete profile` | Delete a profile |
| `Git Profile Switcher: Language` | Change the notification language |

## Where data is stored

| Data | Location |
| --- | --- |
| Profile list | User settings `gitProfileSwitcher.profiles`, shared across all projects and editable by hand in `settings.json` |
| Activation status | Workspace settings `gitProfileSwitcher.enabled` (`.vscode/settings.json`) |
| Project identity | The project's `.git/config` (`git config --local`) |

Your global `~/.gitconfig` is never modified.

Example profile list:

```json
"gitProfileSwitcher.profiles": [
  { "alias": "init", "name": "Exel", "email": "exel@personal.com" },
  { "alias": "work", "name": "Exel", "email": "exel@company.com", "color": "#3b8eea" }
]
```

## Development

```bash
npm install
npm test              # compile + unit tests
npm run package       # build the .vsix
npm run install:local # build + install into your local VS Code
```

Press `F5` in VS Code to launch the Extension Development Host.
