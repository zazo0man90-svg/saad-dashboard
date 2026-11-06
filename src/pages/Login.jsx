import { useState } from 'react';
import { adminConfig } from '../config';
import { auth, firebaseError } from '../services/firebase';
import { connectGithub, loginGoogle, loginEmail, authErrorMessage } from '../services/auth';

function Login({ onLogin }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [createAccount, setCreateAccount] = useState(false);
  const disabled = isLoading || !auth;

  const submit = async operation => {
    setIsLoading(true);
    setError('');
    try {
      const result = await operation();
      setPassword('');
      onLogin(result.user, result.token);
    } catch (error) {
      setError(authErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{adminConfig.siteTitle}</h2>
        <p>Sign in to your dashboard</p>
        {(firebaseError || error) && <p role="alert" className="status-message">{firebaseError || error}</p>}
        <div className="login-providers">
          <button className="btn btn-secondary" onClick={() => submit(loginGoogle)} disabled={disabled}>Sign in with Google</button>
          <button className="btn btn-secondary" onClick={() => submit(connectGithub)} disabled={disabled}>Sign in with GitHub</button>
        </div>
        <form onSubmit={event => { event.preventDefault(); submit(() => loginEmail(email, password, createAccount)); }}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" required value={email}
              disabled={disabled} onChange={event => setEmail(event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete={createAccount ? 'new-password' : 'current-password'}
              required minLength={createAccount ? 6 : undefined} value={password}
              disabled={disabled} onChange={event => setPassword(event.target.value)} />
          </div>
          <button className="btn btn-primary" disabled={disabled} type="submit">
            {isLoading ? 'Please wait…' : createAccount ? 'Create account' : 'Sign in with email'}
          </button>
        </form>
        <button className="btn btn-secondary account-toggle" disabled={disabled} onClick={() => {
          setCreateAccount(!createAccount); setError(''); setPassword('');
        }}>{createAccount ? 'Already have an account? Sign in' : 'New here? Create an account'}</button>
      </div>
    </div>
  );
}

export default Login;
