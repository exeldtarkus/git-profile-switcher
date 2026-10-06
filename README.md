# Git Profile Switcher

🇬🇧 English | 🇮🇩 [Bahasa Indonesia](docs/README.id.md)

A VS Code extension for switching the git profile (`user.name` + `user.email`) per project, with the active profile shown in the status bar.

## Features

- **Global activation**: run `Git Profile Switcher: Activation` once and pick *Enable*. It applies to every project opened in VS Code with this extension installed.
- **Automatic detection**: when activated, the extension reads the git identity your terminal uses in this project (`git config user.name` / `user.email`). If it is not in your profile list yet, it is saved as a profile with the alias **`init`** (or `init-<project-name>` if `init` is already used by another identity).
- **Add profile**: enter an alias, username and email.
- **Edit profile**: change the alias, username, email or color. If the profile is in use in this project, the project's git config is updated too.
- **Delete profile**: asks for confirmation. Your projects' git config is not changed.
- **Profile color**: each profile can have its own status bar text/icon color (a preset or a custom hex such as `#ff8800`). Set it while adding/editing a profile, or with `Git Profile Switcher: Set profile color`.
- **Profile icon**: each profile can have its own status bar icon, picked from presets (briefcase, home, rocket, …) or any [codicon](https://code.visualstudio.com/api/references/icons-in-labels#icon-listing) name such as `coffee` or `sync~spin`. Set it while adding/editing a profile, or with `Git Profile Switcher: Set profile icon`.
- **Open settings JSON**: opens your user `settings.json` at the profile list, so you can edit profiles by hand.
- **Reset**: deletes all saved profiles (they are shared by every project) and recreates a single profile with alias **`init`** from the git identity currently active in the terminal for this project. Asks for confirmation first.
- **Switch profile**: click the status bar item (it also offers *Add*, *Open settings JSON* and *Reset*) (e.g. 💼 `work - Git Profile`) or run `Git Profile Switcher: Switch profile`. The identity is written with `git config --local`, so it only applies to this project.
- **Status bar**: shows the alias of the active profile. It turns yellow when the project's identity is not a saved profile or is not set. It also updates when you change `git config` from the terminal.
- **Notification language**: English by default; switch to Bahasa Indonesia with `Git Profile Switcher: Language`. Command names in the Command Palette follow the same language (e.g. `Switch profile` ↔ `Ganti profile`).

## Commands

| Command | Description |
| --- | --- |
| `Git Profile Switcher: Activation` | Enable/disable the extension for all projects |
| `Git Profile Switcher: Switch profile` | Pick the git profile for this project |
| `Git Profile Switcher: Add profile` | Add a new profile |
| `Git Profile Switcher: Edit profile` | Edit an existing profile |
| `Git Profile Switcher: Set profile color` | Change only a profile's color |
| `Git Profile Switcher: Set profile icon` | Change only a profile's icon |
| `Git Profile Switcher: Delete profile` | Delete a profile |
| `Git Profile Switcher: Open settings JSON` | Open the profile list in user `settings.json` |
| `Git Profile Switcher: Reset` | Delete all profiles and recreate `init` from the current git identity |
| `Git Profile Switcher: Language` | Change the notification language |

## Where data is stored

| Data | Location |
| --- | --- |
| Profile list | User settings `gitProfileSwitcher.profiles`, shared across all projects and editable by hand in `settings.json` |
| Activation status | User settings `gitProfileSwitcher.enabled`, applies to all projects |
| Project identity | The project's `.git/config` (`git config --local`) |

Profiles and the activation status are stored in user settings, so after setting them once they are available in every project, as long as this extension is installed. With Settings Sync turned on, they follow you to other machines too. To turn the extension off for just one project, add `"gitProfileSwitcher.enabled": false` to that project's `.vscode/settings.json`.

Your global `~/.gitconfig` is never modified.

Example profile list:

```json
"gitProfileSwitcher.profiles": [
  { "alias": "init", "name": "Exel", "email": "exel@personal.com" },
  { "alias": "work", "name": "Exel", "email": "exel@company.com", "color": "#3b8eea", "icon": "briefcase" }
]
```

## Development

```bash
npm install
npm test              # compile + unit tests
npm run package       # build the .vsix
npm run install:local # build + install into your local VS Code
npm run deploy        # publish to Open VSX
```

Press `F5` in VS Code to launch the Extension Development Host.

To publish to Open VSX: `npm run deploy`. See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for setup and publishing details.
