// Public Firebase web configuration. Never put server credentials here.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBfnRhlLQQEoshEIw8CKkFx4GV0dxnd-OI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'saad-dashboard-446de.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://saad-dashboard-446de-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'saad-dashboard-446de',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'saad-dashboard-446de.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '832450784066',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:832450784066:web:42c76dbe96f9c08f8636db'
};

export default firebaseConfig;

