Deploy the current project to Vercel and return the live URL.

## Steps

1. **Check Vercel CLI** — run `vercel --version` to see if it's installed. If the command fails, install it globally with `npm install -g vercel`.

2. **Build the project** — run `npm run build`. The output goes to the `build/` directory (not `dist/`). If the build fails, stop and report the error.

3. **Deploy to Vercel** — use the PowerShell tool (not Bash) to run the deploy, because the Bash environment has an npm path issue on this machine:

   ```powershell
   vercel deploy build/ --prod --yes
   ```

   - `build/` — points Vercel at the local build output directory
   - `--prod` — deploys to the production URL (not a preview URL)
   - `--yes` — skips interactive prompts (accepts defaults)

   If this is the first deploy, Vercel CLI will ask you to log in or link a project. Handle the prompts as they appear.

4. **Report the URL** — once the deployment succeeds, extract the production URL from the CLI output and show it to the user so they can open it in a browser.

## Notes

- If the user is not logged in to Vercel, the CLI will prompt for authentication. Guide them through `vercel login` first, then re-run the deploy step.
- If a `vercel.json` does not exist in the project root, Vercel will auto-detect the static site from the `build/` directory — no extra config is needed.
- The deployment URL will look like `https://<project-name>.vercel.app`.
