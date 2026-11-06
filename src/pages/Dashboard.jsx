import { useState, useEffect } from 'react';

function Dashboard() {
  const [stats, setStats] = useState({
    totalRepos: 0,
    totalIssues: 0,
    totalPRs: 0,
    activeRepos: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('github_token');
      
      if (token) {
        try {
          const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100', {
            headers: {
              'Authorization': `token ${token}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          
          if (reposResponse.ok) {
            const repos = await reposResponse.json();
            
            const issuesResponse = await fetch('https://api.github.com/search/issues?q=type:issue+is:open+author:@me', {
              headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
              }
            });
            
            if (issuesResponse.ok) {
              const issuesData = await issuesResponse.json();
              
              setStats({
                totalRepos: repos.length,
                totalIssues: issuesData.total_count,
                totalPRs: 0,
                activeRepos: repos.filter(r => new Date(r.pushed_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
              });
            }
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        }
      }
      
      setIsLoading(false);
    };

    fetchDashboardData();
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
