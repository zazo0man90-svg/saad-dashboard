import { useState, useEffect } from 'react';
import { getRepositories } from '../services/github';

function Repositories() {
  const [repos, setRepos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError('');
    getRepositories(controller.signal)
      .then(data => { if (!controller.signal.aborted) setRepos(data); })
      .catch(error => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  if (isLoading) {
    return (
      <div className="spinner">
        <div className="loading" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Repositories</h1>
      
      {error && <p role="alert">{error} <button className="btn btn-secondary" onClick={() => setAttempt(attempt + 1)}>Retry</button></p>}
      {!error && repos.length === 0 && <p>No repositories are available for this GitHub account.</p>}
      <div className="dashboard-grid">
        {repos.map((repo) => (
          <div className="card" key={repo.id}>
            <h3>
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                {repo.full_name}
              </a>
            </h3>
            <p style={{ color: '#8b949e', marginBottom: '1rem' }}>{repo.description || 'No description'}</p>
            
            <div style={{ display: 'flex', gap: '1rem', color: '#8b949e', fontSize: '0.9rem' }}>
              <span>⭐ {repo.stargazers_count}</span>
              <span>Forks: {repo.forks_count}</span>
              <span>Updated: {new Date(repo.updated_at).toLocaleDateString()}</span>
            </div>
            
            {repo.language && (
              <div style={{ 
                display: 'inline-block', 
                width: '12px', 
                height: '12px', 
                backgroundColor: getLanguageColor(repo.language),
                borderRadius: '50%',
                marginRight: '0.5rem'
              }}></div>
            )}
            <span style={{ color: '#58a6ff' }}>{repo.language}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getLanguageColor(language) {
  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    CSS: '#563d7c',
    HTML: '#e34c26',
    C: '#555555',
    CPlusPlus: '#f34b7d',
    CSharp: '#178600',
    PHP: '#4F5D95',
    Swift: '#ffac45',
    Kotlin: '#F18E33'
  };
  return colors[language] || '#30363d';
}

export default Repositories;

