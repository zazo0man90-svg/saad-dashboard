export async function githubRequest(path, signal) {
  const token = sessionStorage.getItem('github_token');
  if (!token) throw new Error('Sign out and sign in again to reconnect GitHub.');
  const response = await fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }, signal
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Your GitHub session expired. Sign out and sign in again.');
    if (response.status === 403 || response.status === 429) throw new Error('GitHub denied this request or its rate limit was reached. Please try again later.');
    throw new Error(`GitHub request failed (${response.status}). Please try again.`);
  }
  return response.json();
}

export async function getRepositories(signal) {
  const repos = [];
  for (let page = 1; ; page++) {
    const batch = await githubRequest(`/user/repos?per_page=100&page=${page}&sort=updated`, signal);
    repos.push(...batch);
    if (batch.length < 100) return repos;
  }
}
