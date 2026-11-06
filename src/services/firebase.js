import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, remove, onValue, query, orderByChild, equalTo } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app = null;
let db = null;

try {
  // Check if using default placeholder config
  if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase: Using placeholder config. Update firebase.js with your Firebase credentials.');
  }
} catch (error) {
  console.warn('Firebase initialization error:', error.message);
}

export { app, db, ref, set, get, update, remove, onValue, query, orderByChild, equalTo };
