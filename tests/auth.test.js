import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const sdk = vi.hoisted(() => ({
  auth: { currentUser: null }, githubProvider: {}, googleProvider: {},
  GithubAuthProvider: { credentialFromResult: vi.fn() }, signInWithPopup: vi.fn(),
  linkWithPopup: vi.fn(), reauthenticateWithPopup: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(), signInWithEmailAndPassword: vi.fn()
}));
vi.mock('../src/services/firebase', () => sdk);
import { connectGithub, loginGoogle, loginEmail, authErrorMessage } from '../src/services/auth';

beforeEach(() => {
  vi.resetAllMocks();
  sdk.auth.currentUser = null;
  vi.stubGlobal('sessionStorage', { setItem: vi.fn(), removeItem: vi.fn() });
});
afterEach(() => vi.unstubAllGlobals());

it('signs in with Google without requiring or retaining a GitHub token', async () => {
  const user = { uid: 'google-user' };
  sdk.signInWithPopup.mockResolvedValue({ user });
  expect(await loginGoogle()).toEqual({ user, token: null });
  expect(sdk.signInWithPopup).toHaveBeenCalledWith(sdk.auth, sdk.googleProvider);
  expect(sessionStorage.removeItem).toHaveBeenCalledWith('github_token');
});
it('uses email sign-in for existing users and never stores their password', async () => {
  sdk.signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'email-user' } });
  expect(await loginEmail(' user@example.com ', 'password')).toEqual({ user: { uid: 'email-user' }, token: null });
  expect(sdk.signInWithEmailAndPassword).toHaveBeenCalledWith(sdk.auth, 'user@example.com', 'password');
  expect(sdk.createUserWithEmailAndPassword).not.toHaveBeenCalled();
  expect(sessionStorage.setItem).not.toHaveBeenCalled();
});
it('creates an email account only when requested', async () => {
  sdk.createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'new-user' } });
  await loginEmail('new@example.com', 'password', true);
  expect(sdk.createUserWithEmailAndPassword).toHaveBeenCalledWith(sdk.auth, 'new@example.com', 'password');
  expect(sdk.signInWithEmailAndPassword).not.toHaveBeenCalled();
});
it('links GitHub to a Google or email user without switching the Firebase account', async () => {
  const user = { uid: 'existing-user', providerData: [{ providerId: 'google.com' }] };
  sdk.auth.currentUser = user;
  sdk.linkWithPopup.mockResolvedValue({ user });
  sdk.GithubAuthProvider.credentialFromResult.mockReturnValue({ accessToken: 'github-token' });
  expect(await connectGithub()).toEqual({ user, token: 'github-token' });
  expect(sdk.linkWithPopup).toHaveBeenCalledWith(user, sdk.githubProvider);
  expect(sdk.signInWithPopup).not.toHaveBeenCalled();
  expect(sessionStorage.setItem).toHaveBeenCalledWith('github_token', 'github-token');
});
it('reauthenticates an already linked GitHub account to restore its repository token', async () => {
  const user = { uid: 'existing-user', providerData: [{ providerId: 'github.com' }] };
  sdk.auth.currentUser = user;
  sdk.reauthenticateWithPopup.mockResolvedValue({ user });
  sdk.GithubAuthProvider.credentialFromResult.mockReturnValue({ accessToken: 'new-token' });
  expect((await connectGithub()).token).toBe('new-token');
  expect(sdk.reauthenticateWithPopup).toHaveBeenCalledWith(user, sdk.githubProvider);
  expect(sdk.linkWithPopup).not.toHaveBeenCalled();
});
it('supports GitHub as the initial sign-in provider', async () => {
  const user = { uid: 'github-user' };
  sdk.signInWithPopup.mockResolvedValue({ user });
  sdk.GithubAuthProvider.credentialFromResult.mockReturnValue({ accessToken: 'github-token' });
  expect((await connectGithub()).user).toBe(user);
  expect(sdk.signInWithPopup).toHaveBeenCalledWith(sdk.auth, sdk.githubProvider);
});
it('does not overwrite an existing session token when linking fails', async () => {
  sdk.auth.currentUser = { uid: 'existing-user', providerData: [] };
  sdk.linkWithPopup.mockRejectedValue({ code: 'auth/credential-already-in-use' });
  await expect(connectGithub()).rejects.toEqual({ code: 'auth/credential-already-in-use' });
  expect(sessionStorage.setItem).not.toHaveBeenCalled();
  expect(sessionStorage.removeItem).not.toHaveBeenCalled();
});
it('uses a neutral message for invalid email credentials', () => {
  expect(authErrorMessage({ code: 'auth/invalid-credential' })).toBe('The email or password is incorrect.');
  expect(authErrorMessage({ code: 'auth/user-not-found' })).toBe(authErrorMessage({ code: 'auth/wrong-password' }));
});
