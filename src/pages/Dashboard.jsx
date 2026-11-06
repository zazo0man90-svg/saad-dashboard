import { useState, useEffect } from 'react';
import { githubRequest, getRepositories } from '../services/github';

function Dashboard({ token }) {
  const [stats, setStats] = useState({
    totalRepos: 0,
    totalIssues: 0,
    totalPRs: 0,
    activeRepos: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    const controller = new AbortController();
    setIsLoading(true);
    setError('');
    const load = async () => {
      const profile = await githubRequest('/user', controller.signal);
      const [repos, issues, prs] = await Promise.all([
        getRepositories(controller.signal),
        githubRequest('/search/issues?q=' + encodeURIComponent(`type:issue is:open author:${profile.login}`), controller.signal),
        githubRequest('/search/issues?q=' + encodeURIComponent(`type:pr is:open author:${profile.login}`), controller.signal)
      ]);
      if (!controller.signal.aborted) setStats({
        totalRepos: repos.length,
        totalIssues: issues.total_count,
        totalPRs: prs.total_count,
        activeRepos: repos.filter(repo => new Date(repo.pushed_at) > new Date(Date.now() - 30 * 86400000)).length
      });
    };
    load()
      .catch(error => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [attempt, token]);

  if (!token) return <div><h1>Dashboard</h1><div className="card" style={{ marginTop: '1rem' }}>
    <h2>Connect your GitHub account</h2>
    <p>Use Connect GitHub above to load your repositories and activity. Your Firebase account and saved settings are ready to use.</p>
  </div></div>;

  if (isLoading) {
    return (
      <div className="spinner">
        <div className="loading" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
      </div>
    );
  }

  if (error) return <div><h1>Dashboard</h1><p role="alert">{error}</p>
    <button className="btn btn-secondary" onClick={() => setAttempt(attempt + 1)}>Retry</button></div>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="card">
          <h2>Total Repositories</h2>
          <div className="stat-value">{stats.totalRepos}</div>
          <div className="stat-label">All repositories</div>
        </div>
        
        <div className="card">
          <h2>Open Issues</h2>
          <div className="stat-value">{stats.totalIssues}</div>
          <div className="stat-label">Your open issues</div>
        </div>
        
        <div className="card">
          <h2>Active Repos</h2>
          <div className="stat-value">{stats.activeRepos}</div>
          <div className="stat-label">Pushed in last 30 days</div>
        </div>
        
        <div className="card">
          <h2>Open PRs</h2>
          <div className="stat-value">{stats.totalPRs}</div>
          <div className="stat-label">Your open pull requests</div>
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>Quick Stats</h2>
        <p style={{ color: '#8b949e' }}>
          Your dashboard is connected to your GitHub account. 
          You can view your repositories, issues, pull requests, and more from the sidebar.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;

