import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminConfig } from '../config';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubLogin = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: JSON.stringify({
          client_id: adminConfig.github.clientId,
          scope: 'repo read:user user:email'
        })
      });

      const data = await response.json();

      if (data.device_code) {
        window.open(data.verification_uri, '_blank');
        alert(`Open ${data.verification_uri} and enter this code: ${data.user_code}`);
        pollForToken(data.device_code, data.interval);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  const pollForToken = async (deviceCode, interval) => {
    const maxAttempts = 60;
    let attempts = 0;

    const checkToken = async () => {
      attempts++;
      
      try {
        const response = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: JSON.stringify({
            client_id: adminConfig.github.clientId,
            device_code: deviceCode,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
          })
        });

        const data = await response.json();

        if (data.access_token) {
          onLogin(data.access_token);
          navigate('/');
        } else if (data.error === 'authorization_pending') {
          if (attempts < maxAttempts) {
            setTimeout(checkToken, interval * 1000);
          } else {
            alert('Login timeout. Please try again.');
            setIsLoading(false);
          }
        } else {
          alert(`Login failed: ${data.error_description}`);
          setIsLoading(false);
        }
      } catch (error) {
        if (attempts < maxAttempts) {
          setTimeout(checkToken, interval * 1000);
        } else {
          setIsLoading(false);
        }
      }
    };

    checkToken();
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{adminConfig.siteTitle}</h2>
        <p style={{ color: '#8b949e', marginBottom: '1.5rem' }}>
          Sign in with GitHub to access your dashboard
        </p>
        <button 
          className="btn btn-primary" 
          onClick={handleGithubLogin}
          disabled={isLoading}
          style={{ width: '100%', padding: '0.75rem' }}
        >
          {isLoading ? (
            <div className="loading" style={{ width: '20px', height: '20px', borderWidth: '3px' }}></div>
          ) : (
            'Sign in with GitHub'
          )}
        </button>
      </div>
    </div>
  );
}

export default Login;
