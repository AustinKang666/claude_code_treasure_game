# Deploy to GitHub Pages

Deploy the treasure hunt game to GitHub Pages with automatic repository setup and authentication handling.

## Steps

### 1. Check prerequisites

Check that the GitHub CLI is installed:

```powershell
gh --version
```

If missing, tell the user to install it from https://cli.github.com, then re-run this command.

Check authentication:

```powershell
gh auth status
```

If not authenticated, run the following and guide the user through browser-based login:

```powershell
gh auth login
```

After login confirm `gh auth status` shows an active account before continuing.

Also make sure git credential helper is configured so `npx gh-pages` can push:

```powershell
gh auth setup-git
```

### 2. Initialize git repository (if needed)

Check whether the project is already a git repo:

```powershell
git status
```

If the command errors with "not a git repository", initialize one:

```powershell
git init
git add .
git commit -m "Initial commit"
```

### 3. Determine the repository name

Use the project folder name as the default repo name, but clean it up:
- Strip a trailing `-initial` suffix (e.g. `claude_code_treasure_game-initial` → `claude_code_treasure_game`).
- Replace spaces with hyphens and lower-case the result.

Tell the user the name you chose and ask them to confirm or supply a different one before continuing.

### 4. Set up the GitHub remote

Check for an existing `origin` remote:

```powershell
git remote -v
```

**If no remote exists**, create the GitHub repository, link it, and push in one step:

```powershell
gh repo create <repo-name> --public --source=. --remote=origin --push
```

**If a remote already exists**, push any unpushed commits:

```powershell
git push -u origin HEAD
```

Record the GitHub username returned by:

```powershell
gh api user --jq .login
```

You will need `<username>` and `<repo-name>` in later steps.

### 5. Set the Vite base path for GitHub Pages

GitHub Pages serves the site at `https://<username>.github.io/<repo-name>/`, so Vite must know the sub-path. Open `vite.config.ts` and add (or update) the `base` field inside `defineConfig`:

```ts
export default defineConfig({
  base: '/<repo-name>/',   // required for GitHub Pages sub-path hosting
  // ... rest of config unchanged
})
```

If `base` is already set to the correct value, skip this step. If the file was changed, stage and commit it:

```powershell
git add vite.config.ts
git commit -m "Set Vite base path for GitHub Pages"
git push
```

### 6. Build the project

```powershell
npm run build
```

Output goes to `build/`. If the build fails, stop and report the error — do not proceed to deploy.

### 7. Deploy the build output to the `gh-pages` branch

Use `npx gh-pages` (no install needed) to push only the `build/` directory as the root of a `gh-pages` branch:

```powershell
npx gh-pages -d build
```

This creates (or force-updates) a `gh-pages` branch containing only the built assets and pushes it to GitHub. It does not touch your `main` branch.

If the push fails with an authentication error, re-run `gh auth setup-git` and retry.

### 8. Enable GitHub Pages via the API

Tell GitHub to serve the site from the `gh-pages` branch root:

```powershell
gh api repos/<username>/<repo-name>/pages --method POST --field "source[branch]=gh-pages" --field "source[path]=/" 2>&1
```

If Pages is already enabled (HTTP 409), update it instead:

```powershell
gh api repos/<username>/<repo-name>/pages --method PUT --field "source[branch]=gh-pages" --field "source[path]=/"
```

### 9. Report the URL

The live URL is `https://<username>.github.io/<repo-name>/`.

Show this URL to the user and note that GitHub Pages can take **1–2 minutes** to go live on the first deploy. They can track build progress at `https://github.com/<username>/<repo-name>/actions`.

## Notes

- Always use the **PowerShell tool** for shell commands on this machine — the Bash environment has an npm path issue.
- Never force-push to `main` or `master`. `npx gh-pages` only force-pushes to the isolated `gh-pages` branch, which is safe.
- On subsequent deploys only steps 6–9 are needed (skip repo creation and base-path setup once they are done).
- If the user owns a `<username>.github.io` repo, the base path should be `/` instead of `/<repo-name>/`.
