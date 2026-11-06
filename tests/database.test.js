import { beforeEach, describe, expect, it, vi } from 'vitest';

const firebase = vi.hoisted(() => ({
  auth: { currentUser: { uid: 'alice' } }, db: {},
  ref: vi.fn((db, path) => path), get: vi.fn(), set: vi.fn(), update: vi.fn()
}));
vi.mock('../src/services/firebase.js', () => firebase);
import { dbUtils } from '../src/services/database';

beforeEach(() => {
  vi.clearAllMocks();
  firebase.auth.currentUser = { uid: 'alice' };
  firebase.get.mockResolvedValue({ exists: () => false });
  firebase.set.mockResolvedValue();
  firebase.update.mockResolvedValue();
});

describe('Firebase user data', () => {
  it('updates a profile without replacing saved preferences or persisting tokens', async () => {
    const result = await dbUtils.saveUserData('alice', { name: 'Alice', github_token: 'private-token' });
    expect(result.success).toBe(true);
    expect(firebase.set).not.toHaveBeenCalled();
    expect(firebase.update).toHaveBeenCalledWith('users/alice', {
      name: 'Alice', email: '', avatar: '', lastLogin: expect.any(String)
    });
  });
  it('returns an empty result for preferences that have not been saved', async () => {
    expect(await dbUtils.getDashboardPrefs('alice')).toEqual({ success: true, data: null });
  });
  it('saves and reads preferences under the Firebase UID', async () => {
    const prefs = { siteTitle: 'My dashboard', adminEmail: '' };
    await dbUtils.saveDashboardPrefs('alice', prefs);
    expect(firebase.set).toHaveBeenCalledWith('users/alice/dashboardPrefs', prefs);
    firebase.get.mockResolvedValue({ exists: () => true, val: () => prefs });
    expect(await dbUtils.getDashboardPrefs('alice')).toEqual({ success: true, data: prefs });
  });
  it('prevents access under another user ID', async () => {
    expect((await dbUtils.saveDashboardPrefs('bob', {})).success).toBe(false);
    expect(firebase.set).not.toHaveBeenCalled();
  });
  it('does not access the database after sign-out', async () => {
    firebase.auth.currentUser = null;
    expect((await dbUtils.getRepoData(10)).success).toBe(false);
    expect(firebase.get).not.toHaveBeenCalled();
  });
  it('isolates repository records by their owner', async () => {
    await dbUtils.saveRepoData(10, { name: 'repository' });
    expect(firebase.set).toHaveBeenCalledWith('users/alice/repositories/10', {
      name: 'repository', lastSynced: expect.any(String)
    });
  });
  it('returns actual SDK references for the signed-in user only', () => {
    expect(dbUtils.ref('users/alice/dashboardPrefs')).toBe('users/alice/dashboardPrefs');
    expect(() => dbUtils.ref('users/bob')).toThrow();
  });
  it('surfaces permission failures', async () => {
    firebase.set.mockRejectedValueOnce(new Error('Permission denied'));
    expect(await dbUtils.saveDashboardPrefs('alice', {})).toEqual({ success: false, error: 'Permission denied' });
  });
});
