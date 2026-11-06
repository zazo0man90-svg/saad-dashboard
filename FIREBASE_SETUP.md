# Firebase Setup Guide

## Step 1: Create a Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add Project" or "Create a project"
3. Follow the setup wizard to create your project
4. Name it "Saad Dashboard" or whatever you prefer

## Step 2: Add Web App to Firebase

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Enter your app name (e.g., "Saad Dashboard")
3. Check "Also set up Firebase Hosting" if you want to host the dashboard
4. Click "Register app"
5. Copy the `firebaseConfig` object

## Step 3: Enable Realtime Database

1. In Firebase Console, go to **Build** → **Realtime Database**
2. Click **Create Database**
3. Choose a location (closest to your users)
4. Start in **test mode** (we'll configure security rules later)

## Step 4: Configure Your Dashboard

Update `src/services/firebase.js` with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Replace the placeholder values with your actual Firebase credentials.

## Step 5: Security Rules (Production)

Update your Realtime Database rules in Firebase Console:

```json
{
  "rules": {
    "$userId": {
      ".read": "$userId === auth.uid",
      ".write": "$userId === auth.uid"
    }
  }
}
```

## Database Structure

Your dashboard will use this structure:

```
saad-dashboard/
├── users/
│   ├── {userId}/
│   │   ├── email: "user@example.com"
│   │   ├── name: "User Name"
│   │   ├── avatar: "avatar_url"
│   │   ├── lastLogin: "timestamp"
│   │   └── dashboardPrefs/
│   │       └── preferences object
│   └── {userId}/issues/
│       └── synced issues data
└── repositories/
    └── {repoId}/
        └── repository data
```

## Next Steps

1. Update the Firebase configuration in `src/services/firebase.js`
2. Run `npm run dev` to start the dashboard
3. Login with GitHub and start using Firebase storage
