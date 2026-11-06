import { initializeApp } from 'firebase/app';
import { initializeAuth, browserSessionPersistence, browserPopupRedirectResolver, GithubAuthProvider, GoogleAuthProvider, linkWithPopup, reauthenticateWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, set, get, update, remove, onValue, query, orderByChild, equalTo } from 'firebase/database';
import firebaseConfig from '../../firebaseConfig';

const required = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'appId'];
const missing = required.filter(key => !firebaseConfig[key] || firebaseConfig[key].startsWith('YOUR_'));

let app = null;
let auth = null;
let db = null;
let firebaseError = missing.length ? 'Firebase setup required: ' + missing.join(', ') + '. See FIREBASE_SETUP.md.' : '';

if (!firebaseError) {
  try {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, { persistence: browserSessionPersistence, popupRedirectResolver: browserPopupRedirectResolver });
    db = getDatabase(app);
  } catch (error) {
    auth = null;
    db = null;
    firebaseError = 'Firebase could not start: ' + error.message;
  }
}

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
githubProvider.addScope('repo');
githubProvider.addScope('read:user');

export { app, auth, db, firebaseError, githubProvider, googleProvider, GithubAuthProvider,
  linkWithPopup, reauthenticateWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, signOut, onAuthStateChanged,
  ref, set, get, update, remove, onValue, query, orderByChild, equalTo };

