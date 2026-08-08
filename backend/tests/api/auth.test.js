import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockApiFetch } from '../helpers/routeHarness';

vi.mock('../../lib/api/_fetch', () => ({ apiFetch: vi.fn() }));
vi.mock('../../lib/supabase/client', () => ({ createClient: vi.fn() }));

const { apiFetch } = await import('../../lib/api/_fetch');
const { createClient } = await import('../../lib/supabase/client');
const {
  OAUTH_PROVIDERS,
  deleteMyAccount,
  getCurrentUser,
  onAuthChange,
  signInWith,
  signOut,
} = await import('../../lib/api/auth');

let supabase;
let unsubscribe;

beforeEach(() => {
  apiFetch.mockReset();
  unsubscribe = vi.fn();
  supabase = {
    auth: {
      signInWithOAuth: vi.fn(async () => ({ error: null })),
      signOut: vi.fn(async () => ({ error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe } } })),
    },
  };
  createClient.mockReturnValue(supabase);
  vi.stubGlobal('window', { location: { origin: 'http://localhost:3000' } });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('OAUTH_PROVIDERS', () => {
  it('exposes github, google and kakao', () => {
    expect(OAUTH_PROVIDERS.map((p) => p.id)).toEqual(['github', 'google', 'kakao']);
    expect(OAUTH_PROVIDERS.every((p) => p.isEnabled)).toBe(true);
  });
});

describe('signInWith', () => {
  it('rejects when called on the server', async () => {
    vi.stubGlobal('window', undefined);

    await expect(signInWith('github')).rejects.toThrowError(/브라우저에서만/);
    expect(supabase.auth.signInWithOAuth).not.toHaveBeenCalled();
  });

  it('builds the callback url and starts OAuth', async () => {
    await signInWith('github');

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'github',
      options: { redirectTo: 'http://localhost:3000/auth/callback?next=%2F' },
    });
  });

  it('accepts a path to return to after login', async () => {
    await signInWith('kakao', { next: '/mypage?tab=1' });

    expect(supabase.auth.signInWithOAuth.mock.calls[0][0].options.redirectTo).toBe(
      'http://localhost:3000/auth/callback?next=%2Fmypage%3Ftab%3D1'
    );
  });

  it('wraps a start failure in ApiError', async () => {
    supabase.auth.signInWithOAuth.mockResolvedValue({ error: { message: 'provider disabled' } });

    await expect(signInWith('google')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'google 로그인을 시작하지 못했습니다: provider disabled',
    });
  });
});

describe('signOut', () => {
  it('clears the session', async () => {
    await signOut();

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('wraps a failure in ApiError', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: { message: 'network' } });

    await expect(signOut()).rejects.toThrowError('로그아웃에 실패했습니다: network');
  });
});

describe('getCurrentUser', () => {
  it('returns only the user field from /api/me', async () => {
    mockApiFetch(apiFetch, { 'GET /api/me': { user: { id: 'u1', email: 'a@b.c' } } });

    await expect(getCurrentUser()).resolves.toEqual({ id: 'u1', email: 'a@b.c' });
  });

  it('is null when signed out', async () => {
    mockApiFetch(apiFetch, { 'GET /api/me': { user: null } });

    await expect(getCurrentUser()).resolves.toBeNull();
  });
});

describe('onAuthChange', () => {
  it('passes only id and email when a session appears', () => {
    const handler = vi.fn();
    onAuthChange(handler);

    const callback = supabase.auth.onAuthStateChange.mock.calls[0][0];
    callback('SIGNED_IN', { user: { id: 'u1', email: 'a@b.c', extra: 'x' } });

    expect(handler).toHaveBeenCalledWith({ id: 'u1', email: 'a@b.c' });
  });

  it('falls back to null when email is missing', () => {
    const handler = vi.fn();
    onAuthChange(handler);

    supabase.auth.onAuthStateChange.mock.calls[0][0]('SIGNED_IN', { user: { id: 'u1' } });

    expect(handler).toHaveBeenCalledWith({ id: 'u1', email: null });
  });

  it('passes null when there is no session', () => {
    const handler = vi.fn();
    onAuthChange(handler);

    supabase.auth.onAuthStateChange.mock.calls[0][0]('SIGNED_OUT', null);

    expect(handler).toHaveBeenCalledWith(null);
  });

  it('passes null when the session has no user', () => {
    const handler = vi.fn();
    onAuthChange(handler);

    supabase.auth.onAuthStateChange.mock.calls[0][0]('TOKEN_REFRESHED', {});

    expect(handler).toHaveBeenCalledWith(null);
  });

  it('returns an unsubscribe function', () => {
    const stop = onAuthChange(vi.fn());

    stop();

    expect(unsubscribe).toHaveBeenCalled();
  });
});

describe('deleteMyAccount', () => {
  it('deletes the account and signs out', async () => {
    mockApiFetch(apiFetch, { 'DELETE /api/me': null });

    await deleteMyAccount();

    expect(apiFetch).toHaveBeenCalledWith('/api/me', { method: 'DELETE' });
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('does not sign out when deletion fails', async () => {
    apiFetch.mockRejectedValue(new Error('403'));

    await expect(deleteMyAccount()).rejects.toThrow();
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });
});
