# Connect Saad Dashboard to Firebase

The app uses Firebase Authentication with GitHub and **Realtime Database** (not Firestore).

## 1. Configure the web app

In Firebase Console → Project settings → General, register/select a web app and copy its public `firebaseConfig` values. Copy `.env.example` to `.env.local` and fill in the corresponding `VITE_FIREBASE_*` values. Copy the exact `databaseURL` from Realtime Database; regional URLs differ.

These values are public browser configuration. Never add a service-account key or GitHub OAuth client secret to this repository or a `VITE_*` variable. Vite embeds environment values during the build, so configure them on your build host too and rebuild after changes.

## 2. Enable GitHub sign-in

1. Firebase Console → Authentication → Sign-in method → GitHub → Enable.
2. In GitHub Developer settings, create/select an OAuth App. Set its homepage to your dashboard URL and its authorization callback URL to the **exact callback URL shown by Firebase**, usually `https://YOUR_PROJECT.firebaseapp.com/__/auth/handler`.
3. Put the GitHub client ID and client secret into the **Firebase provider configuration only**, then save.
4. Authentication → Settings → Authorized domains: add your dashboard hostname and `localhost` for local development. New Firebase projects may not include localhost automatically.

The old GitHub device flow is no longer used. Sign-in opens a Firebase popup, establishes a Firebase session, and returns a GitHub access token for repository requests. The GitHub token is stored only in the current tab's session storage, never in the database. Opening a new tab/session can require signing in again to reconnect GitHub. The `repo` scope allows private-repository access; organization restrictions may require separate GitHub approval.

## 3. Create Realtime Database and apply rules

Create a Realtime Database in locked mode. Publish the contents of `database.rules.json` in its Rules tab. Data is stored under `users/{firebaseAuthUid}/...`; the Firebase UID is different from a GitHub numeric user ID. Each user can read/write only their own subtree. Unmatched database paths remain denied.

Alternatively, after selecting your project in Firebase CLI:

```sh
firebase deploy --only database --project YOUR_PROJECT_ID
```

Do not deploy these rules over an unrelated existing database without reviewing its current rules and data layout. Legacy records under GitHub IDs or top-level `repositories` are not migrated automatically.

## 4. Run and verify

```sh
npm ci
npm test
npm run dev
```

Sign in with GitHub. Your name should appear and a profile should be created at `users/{uid}`. Open Settings, change the title, save, and reload: the saved title should return from Firebase. Confirm a second account cannot read the first account's data. A database permission or connection failure is shown in the dashboard instead of being silently ignored.

## 5. Build and host

```sh
npm run build
firebase deploy --only hosting --project YOUR_PROJECT_ID
```

`firebase.json` serves `dist` and rewrites application routes to `index.html`, so refreshing `/settings` or `/repositories` works. For another hosting service configure the same SPA fallback. Always build with your Firebase environment values before deploying; the checked-in legacy `dist` is not the source of truth.

If login fails, the page gives setup, provider, authorized-domain, popup, or network guidance. Full live verification requires a real Firebase project, enabled GitHub provider, published database rules, and an authorized website domain.
