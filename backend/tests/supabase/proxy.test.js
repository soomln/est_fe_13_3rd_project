import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const state = { options: null, auth: null };

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn((url, key, options) => {
    state.options = options;
    return { url, key, auth: state.auth };
  }),
}));

const { createServerClient } = await import('@supabase/ssr');

function makeRequest(cookies = []) {
  const jar = new Map(cookies.map(({ name, value }) => [name, value]));
  return {
    cookies: {
      getAll: vi.fn(() => [...jar].map(([name, value]) => ({ name, value }))),
      set: vi.fn((name, value) => jar.set(name, value)),
    },
    jar,
  };
}

const loadProxy = () => import('../../lib/supabase/proxy');

beforeEach(() => {
  vi.resetModules();
  state.options = null;
  state.auth = { getClaims: vi.fn(async () => ({ data: null, error: null })) };
  createServerClient.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('without env vars', () => {
  it('skips the session refresh and leaves user null', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { updateSession } = await loadProxy();
    const { response, user } = await updateSession(makeRequest());

    expect(user).toBeNull();
    expect(response).toBeDefined();
    expect(createServerClient).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('warns only once per process', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { updateSession } = await loadProxy();
    await updateSession(makeRequest());
    await updateSession(makeRequest());
    await updateSession(makeRequest());

    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});

describe('with env vars', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_x');
  });

  it('builds the server client from the request cookies', async () => {
    const request = makeRequest([{ name: 'sb-token', value: 'abc' }]);

    const { updateSession } = await loadProxy();
    await updateSession(request);

    expect(createServerClient).toHaveBeenCalledWith(
      'https://abc.supabase.co',
      'sb_publishable_x',
      expect.any(Object)
    );
    expect(state.options.cookies.getAll()).toEqual([{ name: 'sb-token', value: 'abc' }]);
  });

  it('returns a user when there are claims', async () => {
    state.auth.getClaims = vi.fn(async () => ({
      data: { claims: { sub: 'u1', email: 'a@b.c' } },
    }));

    const { updateSession } = await loadProxy();
    const { user } = await updateSession(makeRequest());

    expect(user).toEqual({ id: 'u1', email: 'a@b.c' });
  });

  it('falls back to null when the claims have no email', async () => {
    state.auth.getClaims = vi.fn(async () => ({ data: { claims: { sub: 'u1' } } }));

    const { updateSession } = await loadProxy();
    const { user } = await updateSession(makeRequest());

    expect(user).toEqual({ id: 'u1', email: null });
  });

  it('still answers normally with a null user when getClaims throws', async () => {
    state.auth.getClaims = vi.fn(async () => {
      throw new Error('network');
    });

    const { updateSession } = await loadProxy();
    const { response, user } = await updateSession(makeRequest());

    expect(user).toBeNull();
    expect(response).toBeDefined();
  });

  it('setAll updates both the request and response cookies', async () => {
    const request = makeRequest();

    const { updateSession } = await loadProxy();
    await updateSession(request);

    state.options.cookies.setAll([{ name: 'sb-token', value: 'fresh', options: { path: '/' } }]);

    expect(request.cookies.set).toHaveBeenCalledWith('sb-token', 'fresh');
    expect(request.jar.get('sb-token')).toBe('fresh');
  });

  it('headers passed to setAll land on the response', async () => {
    const request = makeRequest();

    const { updateSession } = await loadProxy();
    await updateSession(request);

    expect(() =>
      state.options.cookies.setAll([{ name: 'a', value: '1' }], { 'x-trace': 'abc' })
    ).not.toThrow();
  });

  it('works when the headers argument is omitted', async () => {
    const request = makeRequest();

    const { updateSession } = await loadProxy();
    await updateSession(request);

    expect(() => state.options.cookies.setAll([{ name: 'a', value: '1' }])).not.toThrow();
  });
});
