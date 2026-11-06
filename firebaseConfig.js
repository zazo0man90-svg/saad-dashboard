// Firebase configuration - Replace with your Firebase project credentials
// Get these from https://console.firebase.google.com/

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// TODO: Replace with your actual Firebase configuration
// For now, this will throw an error until you configure it
if (firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.warn("Firebase not configured. Please update firebaseConfig.js with your Firebase project credentials.");
}

export default firebaseConfig;
