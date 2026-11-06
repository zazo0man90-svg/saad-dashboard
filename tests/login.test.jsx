// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import Login from '../src/pages/Login';

const mocks = vi.hoisted(() => ({
  connectGithub: vi.fn(), loginGoogle: vi.fn(), loginEmail: vi.fn(), authErrorMessage: vi.fn(error => error.message)
}));
vi.mock('../src/services/auth', () => mocks);
vi.mock('../src/services/firebase', () => ({ auth: {}, firebaseError: '' }));
afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

it('lets Google users enter the dashboard without a GitHub token', async () => {
  const onLogin = vi.fn();
  const user = { uid: 'google-user' };
  mocks.loginGoogle.mockResolvedValue({ user, token: null });
  render(<Login onLogin={onLogin} />);
  fireEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }));
  await waitFor(() => expect(onLogin).toHaveBeenCalledWith(user, null));
});
it('submits email sign-in and explicit account creation as separate actions', async () => {
  const onLogin = vi.fn();
  mocks.loginEmail.mockResolvedValue({ user: { uid: 'email-user' }, token: null });
  render(<Login onLogin={onLogin} />);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in with email' }));
  await waitFor(() => expect(mocks.loginEmail).toHaveBeenCalledWith('user@example.com', 'password1', false));
  await waitFor(() => expect(onLogin).toHaveBeenCalled());
  fireEvent.click(screen.getByRole('button', { name: 'New here? Create an account' }));
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password2' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
  await waitFor(() => expect(mocks.loginEmail).toHaveBeenCalledWith('user@example.com', 'password2', true));
});
it('shows failed email authentication and allows another attempt', async () => {
  const onLogin = vi.fn();
  mocks.loginEmail.mockRejectedValue(new Error('Incorrect email or password'));
  render(<Login onLogin={onLogin} />);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in with email' }));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Incorrect email or password'));
  expect(screen.getByRole('button', { name: 'Sign in with email' }).disabled).toBe(false);
  expect(onLogin).not.toHaveBeenCalled();
});
