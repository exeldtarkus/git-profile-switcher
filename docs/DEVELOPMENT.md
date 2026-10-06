# Development & Publishing

🇬🇧 English | 🇮🇩 [Bahasa Indonesia](DEVELOPMENT.id.md)

A guide to running this extension locally and publishing it to the [Open VSX Registry](https://open-vsx.org/).

## Prerequisites

- Node.js 20+ and npm
- VS Code (or a compatible editor such as VSCodium/Cursor)
- Git

---

## Running locally

### 1. Clone & install dependencies

```bash
git clone https://github.com/exeldtarkus/git-profile-switcher.git
cd git-profile-switcher
npm install
```

### 2. Compile

```bash
npm run compile   # compile once
npm run watch     # recompile on every change
```

Compiled output goes to `out/`.

### 3. Run unit tests

```bash
npm test
```

### 4. Debug with the Extension Development Host (F5)

1. Open the `git-profile-switcher` folder in VS Code.
2. Press **F5** (or **Run → Start Debugging**, configuration *Run Extension*).
3. A new **Extension Development Host** window opens with this extension loaded.
4. In that window, open a test project (see the next step) and try switching profiles.
5. Breakpoints in `src/*.ts` work directly. After changing code, press `Ctrl+Shift+F5` to restart.

### 5. Create a test project

```bash
mkdir -p ~/git-profile-test && cd ~/git-profile-test
git init
git config --local user.name "Test User"
git config --local user.email "test@example.com"
mkdir -p .vscode && echo '{ "gitProfileSwitcher.enabled": true }' > .vscode/settings.json
```

Test scenario in the Extension Development Host:

1. Open `~/git-profile-test`: a popup says the current identity was saved as profile `init`, and the status bar shows 👤 `init - Git Profile`.
2. Run `Git Profile Switcher: Add profile` (e.g. alias `work`, pick a color) → choose *Use in this project*.
   The status bar shows 👤 `work - Git Profile` in that color.
3. In the terminal:
   ```bash
   git config --local user.email   # the email of profile 'work'
   git config --local user.email other@example.com
   ```
   The status bar turns yellow (👤 unknown) because that identity is not a saved profile.
4. Click the status bar item and pick `init` again.

### 6. Build & install the `.vsix` locally

```bash
npm run package
code --install-extension git-profile-switcher-0.2.1.vsix
```

Uninstall:

```bash
code --uninstall-extension exeltarkus.git-profile-switcher
```

---

## Deploying to Open VSX (open-vsx.org)

### 1. Account setup (one time)

1. Create an **Eclipse Foundation** account at <https://accounts.eclipse.org/user/register>.
   Fill in the **GitHub Username** field with your GitHub username (`exeldtarkus`).
2. Log in to <https://open-vsx.org> with **GitHub**.
3. Go to **Settings** (avatar → *Settings*) → **Log in with Eclipse** to link your Eclipse account.
4. Sign the **Eclipse Foundation Open VSX Publisher Agreement** shown on that page.
5. Go to **Settings → Access Tokens** → **Generate New Token**. Save the token (it is shown only once).

Store the token in an environment variable so you don't have to retype it:

```bash
export OVSX_PAT=<your-token>
```

### 2. Create the namespace (one time)

The namespace must match the `publisher` field in `package.json` (currently `exeltarkus`):

```bash
npx ovsx create-namespace exeltarkus -p $OVSX_PAT
```

> Optional: to get the namespace marked as **verified**, file an ownership claim at
> <https://github.com/EclipseFdn/open-vsx.org/issues> (template *Claim namespace ownership*).

### 3. Pre-publish checklist

- [ ] `version` in `package.json` has been bumped (Open VSX rejects versions that were already published):
      `npm version patch` (or `minor` / `major`) — also creates a git commit & tag.
- [x] A `LICENSE` file exists at the project root (already present, MIT).
- [ ] The `"repository"` field in `package.json` points to GitHub, so relative links in the README work:
      ```json
      "repository": { "type": "git", "url": "https://github.com/exeldtarkus/git-profile-switcher.git" }
      ```
- [ ] `npm test` passes.
- [ ] Check the package contents: `npx vsce ls`.

### 4. Publish

**Easiest: `npm run deploy`.** On the first run it asks for your access token (hidden input) and saves it to
`deployment/vsx/token` (git-ignored, excluded from the VSIX). It then skips if this version is already on Open VSX,
creates the namespace if needed, verifies the token, runs the tests, packages, and publishes.
Use `npm run deploy -- --new-token` to replace an expired token.

Or manually:

Publish straight from source (runs `vscode:prepublish` → compile automatically):

```bash
npx ovsx publish -p $OVSX_PAT
```

Or publish a prebuilt `.vsix`:

```bash
npm run package
npx ovsx publish git-profile-switcher-0.2.1.vsix -p $OVSX_PAT
```

Once published, the extension is available at:
<https://open-vsx.org/extension/exeltarkus/git-profile-switcher>

It usually takes a few minutes before it can be searched and installed from VSCodium / other editors that use Open VSX.
