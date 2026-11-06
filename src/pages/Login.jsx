import { useState } from 'react';
import { adminConfig } from '../config';
import { auth, firebaseError, githubProvider, GithubAuthProvider, signInWithPopup, signOut } from '../services/firebase';

const messages = {
  'auth/popup-blocked': 'Allow popups for this site, then try again.',
  'auth/popup-closed-by-user': 'Sign-in was closed. Try again when ready.',
  'auth/unauthorized-domain': 'Add this website domain to Firebase Authentication → Settings → Authorized domains.',
  'auth/operation-not-allowed': 'Enable GitHub in Firebase Authentication → Sign-in method.',
  'auth/account-exists-with-different-credential': 'This email already uses another sign-in provider. Sign in with that provider first.',
  'auth/network-request-failed': 'Could not reach Firebase. Check your connection and try again.'
};

function Login({ onLogin }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGithubLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const token = GithubAuthProvider.credentialFromResult(result)?.accessToken;
      if (!token) throw new Error('GitHub did not return an access token. Please try again.');
      // Keep the GitHub token out of Firebase and persistent local storage.
      sessionStorage.setItem('github_token', token);
      onLogin(result.user, token);
    } catch (error) {
      sessionStorage.removeItem('github_token');
      if (auth?.currentUser) await signOut(auth).catch(() => {});
      setError(messages[error.code] || error.message || 'Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{adminConfig.siteTitle}</h2>
        <p style={{ color: '#8b949e', marginBottom: '1.5rem' }}>
          Sign in with GitHub to connect your repositories and Firebase dashboard.
        </p>
        {(firebaseError || error) && <p role="alert" className="status-message">{firebaseError || error}</p>}
        <button className="btn btn-primary" onClick={handleGithubLogin}
          disabled={isLoading || !auth} style={{ width: '100%', padding: '0.75rem' }}>
          {isLoading ? 'Signing in…' : 'Sign in with GitHub'}
        </button>
      </div>
    </div>
  );
}

export default Login;

