// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import App from '../src/App';

const state = vi.hoisted(() => ({
  user: { uid: 'email-user', email: 'user@example.com', displayName: '', photoURL: '' },
  saveUserData: vi.fn(), getDashboardPrefs: vi.fn(), saveDashboardPrefs: vi.fn(), connectGithub: vi.fn()
}));
vi.mock('../src/services/firebase', () => ({
  auth: {}, onAuthStateChanged: (auth, callback) => { callback(state.user); return () => {}; },
  signOut: vi.fn(), firebaseError: ''
}));
vi.mock('../src/services/auth', () => ({
  connectGithub: state.connectGithub, authErrorMessage: error => error.message
}));
vi.mock('../src/services/database', () => ({ dbUtils: state }));
afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks(); sessionStorage.clear(); localStorage.clear();
  state.saveUserData.mockResolvedValue({ success: true });
  state.getDashboardPrefs.mockResolvedValue({ success: true, data: null });
  state.saveDashboardPrefs.mockResolvedValue({ success: true });
});
it('gives email users a dashboard and settings access before connecting GitHub', async () => {
  window.history.replaceState({}, '', '/');
  render(<App />);
  expect(await screen.findByRole('heading', { name: 'Connect your GitHub account' })).toBeTruthy();
  await waitFor(() => expect(state.saveUserData).toHaveBeenCalledWith('email-user', expect.objectContaining({ email: 'user@example.com' })));
  fireEvent.click(screen.getByRole('link', { name: 'Settings' }));
  fireEvent.change(screen.getByLabelText('Site Title'), { target: { value: 'My title' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
  await waitFor(() => expect(state.saveDashboardPrefs).toHaveBeenCalledWith('email-user', { siteTitle: 'My title', adminEmail: 'saad@example.com' }));
  expect(await screen.findByRole('heading', { name: 'My title' })).toBeTruthy();
});
it('keeps the dashboard accessible when connecting GitHub is cancelled', async () => {
  window.history.replaceState({}, '', '/repositories');
  state.connectGithub.mockRejectedValue(new Error('Sign-in was closed'));
  render(<App />);
  fireEvent.click(await screen.findByRole('button', { name: 'Connect GitHub' }));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Sign-in was closed'));
  expect(screen.getByRole('heading', { name: 'Repositories' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Connect GitHub' }).disabled).toBe(false);
});
