import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { adminConfig } from './config';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import Settings from './pages/Settings';
import './styles.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('github_token');
    if (storedToken) {
      setToken(storedToken);
      verifyToken(storedToken);
    }
  }, []);

  const verifyToken = async (accessToken) => {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      localStorage.removeItem('github_token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const handleLogin = (accessToken) => {
    localStorage.setItem('github_token', accessToken);
    setToken(accessToken);
    verifyToken(accessToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('github_token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <div className="app">
        {isAuthenticated ? (
          <>
            <header className="header">
              <h1>{adminConfig.siteTitle}</h1>
              <div className="user-info">
                {user && (
                  <img 
                    src={user.avatar_url} 
                    alt={user.login} 
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                  />
                )}
                <span>{user?.login || 'User'}</span>
                <button className="btn btn-secondary" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </header>
            <nav className="sidebar">
              <nav>
                <a href="/" className="active">Dashboard</a>
                <a href="/repositories">Repositories</a>
                <a href="/settings">Settings</a>
              </nav>
            </nav>
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/repositories" element={<Repositories />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </>
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
