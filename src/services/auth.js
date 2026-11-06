import {
  auth, githubProvider, googleProvider, GithubAuthProvider, signInWithPopup,
  linkWithPopup, reauthenticateWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword
} from './firebase';

export async function connectGithub() {
  // Link GitHub to an existing email/Google account so its Firebase UID and saved data stay intact.
  const user = auth.currentUser;
  const alreadyLinked = user?.providerData.some(provider => provider.providerId === 'github.com');
  const result = user
    ? await (alreadyLinked ? reauthenticateWithPopup : linkWithPopup)(user, githubProvider)
    : await signInWithPopup(auth, githubProvider);
  const token = GithubAuthProvider.credentialFromResult(result)?.accessToken;
  if (!token) throw new Error('GitHub did not return an access token. Please connect GitHub again.');
  sessionStorage.setItem('github_token', token);
  return { user: result.user, token };
}

export async function loginGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  sessionStorage.removeItem('github_token');
  return { user: result.user, token: null };
}

export async function loginEmail(email, password, createAccount = false) {
  const result = await (createAccount ? createUserWithEmailAndPassword : signInWithEmailAndPassword)(auth, email.trim(), password);
  sessionStorage.removeItem('github_token');
  return { user: result.user, token: null };
}

const messages = {
  'auth/configuration-not-found': 'Firebase Authentication is not configured for this project. Enable the sign-in providers in Firebase Console.',
  'auth/invalid-api-key': 'The Firebase API key is invalid. Check the web app configuration in Firebase Project settings.',
  'auth/popup-blocked': 'Allow popups for this site, then try again.',
  'auth/popup-closed-by-user': 'Sign-in was closed. Try again when ready.',
  'auth/unauthorized-domain': 'Add this website domain to Firebase Authentication → Settings → Authorized domains.',
  'auth/operation-not-allowed': 'Enable this sign-in provider in Firebase Authentication → Sign-in method.',
  'auth/account-exists-with-different-credential': 'This email already uses another sign-in provider. Sign in with that provider first.',
  'auth/credential-already-in-use': 'This GitHub account belongs to another dashboard account. Sign in with that account instead.',
  'auth/provider-already-linked': 'GitHub is already linked. Sign out and sign in with GitHub to reconnect its access token.',
  'auth/email-already-in-use': 'An account already exists for this email. Sign in instead or use its original sign-in provider.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/invalid-credential': 'The email or password is incorrect.',
  'auth/wrong-password': 'The email or password is incorrect.',
  'auth/user-not-found': 'The email or password is incorrect.',
  'auth/weak-password': 'Choose a stronger password that meets your Firebase password policy.',
  'auth/password-does-not-meet-requirements': 'Choose a stronger password that meets your Firebase password policy.',
  'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
  'auth/network-request-failed': 'Could not reach Firebase. Check your connection and try again.'
};

export function authErrorMessage(error) {
  return messages[error.code] || error.message || 'Sign-in failed. Please try again.';
}
