import { useState, useEffect } from 'react';

function Repositories() {
  const [repos, setRepos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      const token = localStorage.getItem('github_token');
      
      if (token) {
        try {
          const response = await fetch('https://api.github.com/user/repos?per_page=100', {
            headers: {
              'Authorization': `token ${token}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setRepos(data);
          }
        } catch (error) {
          console.error('Error fetching repositories:', error);
        }
      }
      
      setIsLoading(false);
    };

    fetchRepos();
  }, []);

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
