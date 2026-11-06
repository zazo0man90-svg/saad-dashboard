# Saad Dashboard Firebase setup

The app uses Firebase Authentication (Google, email/password, and GitHub) and Realtime Database.

## Project configuration

Public web configuration for `saad-dashboard-446de` is included, including its verified database endpoint:

```
https://saad-dashboard-446de-default-rtdb.europe-west1.firebasedatabase.app
```

No environment file is required for this project. To override it for another project, copy `.env.example` to `.env.local` and change the `VITE_FIREBASE_*` values. Vite embeds these values at build time; rebuild after changes. Never put service-account keys or OAuth client secrets in browser configuration.

## Sign-in providers

Enable the providers you want under Firebase Console → Authentication → Sign-in method:

- **Google:** enable the provider and select a project support email.
- **Email/Password:** enable the password option. Existing users can sign in; new users select Create an account. Firebase enforces the configured password policy. The app does not store passwords.
- **GitHub:** enter your GitHub OAuth App's client ID and secret in Firebase's provider settings only. Set the OAuth App's authorization callback URL to the exact URL Firebase shows, usually `https://saad-dashboard-446de.firebaseapp.com/__/auth/handler`.

Under Authentication → Settings → Authorized domains, add the hostname of your deployment. The checked public Firebase configuration currently includes localhost, `saad-dashboard-446de.firebaseapp.com`, and `saad-dashboard-446de.web.app`.

Google/email users can enter the dashboard and save settings immediately. Select **Connect GitHub** in the header to authorize repository access. This links GitHub to the current Firebase account, preserving its UID and saved data. If GitHub is already linked, reconnecting reauthenticates that account. If the GitHub credential belongs to a different existing Firebase account, the app explains the conflict rather than merging users automatically.

GitHub sign-in is also available directly from the login page. The GitHub `repo` scope includes private repositories; organization policies may require additional approval. Firebase auth and GitHub tokens are scoped to the browser tab session. GitHub access tokens are never written to the database. A new browser session may require reconnecting GitHub.

## Apply the database rules

In Realtime Database → Rules, review and publish the contents of `database.rules.json`. The live endpoint responded to an anonymous read during setup, so the supplied user-specific rules still need to be applied and verified before storing personal data.

Data is stored under `users/{firebaseAuthUid}/...`. These rules allow only that authenticated UID to read/write its subtree; all other paths are denied. A Firebase UID differs from a GitHub numeric user ID. Profile updates preserve saved settings. Legacy top-level repository records or records under GitHub IDs are not automatically migrated.

Alternatively, with Firebase CLI authenticated to this project:

```sh
firebase deploy --only database --project saad-dashboard-446de
```

Review any existing database and rules before replacing them.

## Run and verify

```sh
npm ci
npm test
npm run dev
```

Test Google sign-in, email account creation, and email sign-in with your own test accounts. Verify your profile appears under `users/{uid}`. Change the title in Settings, save, and reload to verify persistence. Connect GitHub, confirm repositories load, and verify settings remain on the same Firebase UID. Confirm a second account cannot read the first account's data after publishing rules.

Automated tests cover provider selection, email sign-in vs. registration, GitHub linking/reconnection, failed sign-in recovery, authenticated access without GitHub, database scoping, settings, and GitHub requests. They mock external services; they do not establish live OAuth or database write success.

## Build and deploy

```sh
npm run build
firebase deploy --only hosting --project saad-dashboard-446de
```

`firebase.json` serves the new `dist` build with an SPA fallback so refreshing `/settings` and `/repositories` works. Other hosts need the same fallback. Rebuild before deployment; legacy checked-in `dist` files are not the source of truth.

No Firebase Console settings, live database rules, or deployments are changed by committing this source code. Live end-to-end verification requires provider configuration, the authorized deployment domain, published rules, and an interactive user sign-in.
