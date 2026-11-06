# Saad Workspace

GitHub Pages: https://zazo0man90-svg.github.io/saad-dashboard/

Select **Explore the demo workspace** to inspect the menus and edit sample projects. Demo changes stay in this browser; they never write to Firebase.

## First-time admin

Select **First time? Set up main admin**, choose your password for `zazo0man90@gmail.com`, and create the account. Verify your email using the dashboard banner, then select **I’ve verified**. Google sign-in with the same verified email also unlocks the admin UI. No password is embedded in the website. The contact-email preference does not change the fixed owner identity. Admin UI visibility does not grant access to other users’ database records.

## Required Firebase setup

Before real sign-in and private storage:

- Add `zazo0man90-svg.github.io` to Authentication → Settings → Authorized domains.
- Enable Google, Email/Password, and optionally GitHub (with its OAuth App callback matching Firebase's auth handler).
- Publish `database.rules.json` in Realtime Database → Rules. The live endpoint initially allowed anonymous reads; the supplied rules restrict data to its authenticated owner.

The public Firebase configuration and verified Europe West database URL are included. No live provider settings or database rules have been changed automatically.

## Offline database

The sidebar shows Connected, Offline, Syncing, or Needs attention. Click it for pending edits, last sync time, and retry. Project and preference writes commit to IndexedDB before entering a persistent per-user outbox. Reconnection replays writes in order, removes acknowledged writes, and refreshes cached data. Permission failures retain queued edits. Sign-out prevents another user from flushing or reading a previous account's queue.

Firebase remembers your signed-in account for offline access. GitHub tokens remain tab-scoped and matched to the Firebase UID. Open the site online once and sign in before relying on offline access. Login and uncached GitHub requests need a network. The production service worker caches the app shell; Google Fonts use a system-font fallback offline. Don't clear browser data before pending changes synchronize. For edits to the same data on several devices, the last synchronized write wins; project arrays are not collaboratively merged.

## Editing and GitHub Pages

```sh
npm ci
npm run dev
npm test
npm run pages
```

Edit `src/`, `app.html`, `public/`, and `firebaseConfig.js`. Root `index.html`, `assets/`, `sw.js`, `favicon.svg`, and `.nojekyll` are generated hosting files. Run `npm run pages` and commit them with the source to main. The existing Pages setup serves the repository root. Production uses hash routes, so Pages needs no server rewrites. A new offline app version is offered through Update & reload.

The UI includes Overview, Projects, Repositories, Activity, Analytics, Team, Integrations, Settings, and owner Administration. Team is currently a personal workspace. Tests mock external services; live OAuth and authenticated database writes need an interactive account check.
