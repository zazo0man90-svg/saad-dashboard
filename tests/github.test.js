import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { getRepositories, githubRequest } from '../src/services/github';

beforeEach(() => {
  vi.stubGlobal('sessionStorage', { getItem: vi.fn(() => 'session-token') });
  vi.stubGlobal('fetch', vi.fn());
});
afterEach(() => vi.unstubAllGlobals());

it('loads repositories beyond the first page', async () => {
  const first = Array.from({ length: 100 }, (_, id) => ({ id }));
  fetch.mockResolvedValueOnce({ ok: true, json: async () => first })
    .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 100 }] });
  expect(await getRepositories()).toHaveLength(101);
  expect(fetch.mock.calls[1][0]).toContain('page=2');
  expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer session-token');
});
it('explains expired GitHub sessions', async () => {
  fetch.mockResolvedValue({ ok: false, status: 401 });
  await expect(githubRequest('/user')).rejects.toThrow('session expired');
});
it('reports rate limits rather than showing empty statistics', async () => {
  fetch.mockResolvedValue({ ok: false, status: 403 });
  await expect(githubRequest('/user')).rejects.toThrow('rate limit');
});
it('requests a reconnect when no GitHub token is available', async () => {
  sessionStorage.getItem.mockReturnValue(null);
  await expect(githubRequest('/user')).rejects.toThrow('reconnect GitHub');
  expect(fetch).not.toHaveBeenCalled();
});
