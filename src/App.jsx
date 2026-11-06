import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { adminConfig } from './config';
import { auth, onAuthStateChanged, signOut } from './services/firebase';
import { dbUtils } from './services/database';
import { connectGithub, authErrorMessage } from './services/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import Settings from './pages/Settings';
import './styles.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(auth));
  const [config, setConfig] = useState(adminConfig);
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    localStorage.removeItem('github_token');
    if (!auth) return;
    return onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setToken(currentUser ? sessionStorage.getItem('github_token') : null);
      if (!currentUser) sessionStorage.removeItem('github_token');
      setIsLoading(false);
    }, error => {
      setError(error.message);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    let active = true;
    setConfig(adminConfig);
    setError('');
    if (!user) return;
    const sync = async () => {
      const saved = await dbUtils.saveUserData(user.uid, {
        name: user.displayName || '',
        email: user.email || '',
        avatar: user.photoURL || ''
      });
      if (!active) return;
      if (!saved.success) setError('Firebase could not save your profile: ' + saved.error);
      const prefs = await dbUtils.getDashboardPrefs(user.uid);
      if (!active) return;
      if (prefs.success && prefs.data) {
        setConfig({ ...adminConfig, siteTitle: prefs.data.siteTitle || adminConfig.siteTitle,
          adminEmail: prefs.data.adminEmail || adminConfig.adminEmail });
      } else if (!prefs.success) {
        setError('Firebase could not load settings: ' + prefs.error);
      }
    };
    sync();
    return () => { active = false; };
  }, [user?.uid]);

  const handleConnectGithub = async () => {
    setIsConnecting(true);
    setError('');
    try {
      const result = await connectGithub();
      setUser(result.user);
      setToken(result.token);
    } catch (error) {
      setError(authErrorMessage(error));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem('github_token');
      setToken(null);
      setUser(null);
    } catch (error) {
      setError('Sign-out failed: ' + error.message);
    }
  };

  return (
    <BrowserRouter>
      <div className="app">
        {isLoading ? <div className="spinner" role="status">Loading your session…</div> : user ? (
          <>
            <header className="header">
              <h1>{config.siteTitle}</h1>
              <div className="user-info">
                {user.photoURL && <img src={user.photoURL} alt="" width="32" height="32" style={{ borderRadius: '50%' }} />}
                <span>{user.displayName || user.email || 'User'}</span>
                {!token && <button className="btn btn-primary" disabled={isConnecting} onClick={handleConnectGithub}>
                  {isConnecting ? 'Connecting…' : 'Connect GitHub'}
                </button>}
                <button className="btn btn-secondary" disabled={isConnecting} onClick={handleLogout}>Logout</button>
              </div>
            </header>
            <aside className="sidebar">
              <nav aria-label="Main navigation">
                <NavLink to="/" end>Dashboard</NavLink>
                <NavLink to="/repositories">Repositories</NavLink>
                <NavLink to="/settings">Settings</NavLink>
              </nav>
            </aside>
            <main className="main-content">
              {error && <p role="alert" className="status-message">{error}</p>}
              <Routes>
                <Route path="/" element={<Dashboard token={token} />} />
                <Route path="/repositories" element={<Repositories token={token} />} />
                <Route path="/settings" element={<Settings userId={user.uid} config={config} onSave={setConfig} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </>
        ) : <Login onLogin={(currentUser, accessToken) => { setUser(currentUser); setToken(accessToken); }} />}
      </div>
    </BrowserRouter>
  );
}

export default App;

