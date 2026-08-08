import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = { options: null, auth: null, cookieStore: null };

vi.mock('next/headers', () => ({
  cookies: async () => state.cookieStore,
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn((url, key, options) => {
    state.options = options;
    return { url, key, auth: state.auth };
  }),
}));

const { createServerClient } = await import('@supabase/ssr');
const { createClient, getServerUser } = await import('../../lib/supabase/server');

function makeCookieStore({ throwOnSet = false } = {}) {
  const jar = [];
  return {
    jar,
    getAll: vi.fn(() => jar),
    set: vi.fn((name, value, options) => {
      if (throwOnSet) throw new Error('Server Component 에서는 쓸 수 없습니다.');
      jar.push({ name, value, options });
    }),
  };
}

beforeEach(() => {
  state.options = null;
  state.auth = { getClaims: vi.fn(async () => ({ data: null, error: null })) };
  state.cookieStore = makeCookieStore();
});

describe('createClient', () => {
  it('builds the server client with the env vars and a cookie adapter', async () => {
    await createClient();

    expect(createServerClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      expect.objectContaining({ cookies: expect.any(Object) })
    );
  });

  it('getAll reads straight from the cookie store', async () => {
    state.cookieStore.jar.push({ name: 'sb-token', value: 'abc' });
    await createClient();

    expect(state.options.cookies.getAll()).toEqual([{ name: 'sb-token', value: 'abc' }]);
    expect(state.cookieStore.getAll).toHaveBeenCalled();
  });

  it('setAll stores each cookie it is given', async () => {
    await createClient();

    state.options.cookies.setAll([
      { name: 'a', value: '1', options: { path: '/' } },
      { name: 'b', value: '2', options: undefined },
    ]);

    expect(state.cookieStore.set).toHaveBeenCalledTimes(2);
    expect(state.cookieStore.set).toHaveBeenCalledWith('a', '1', { path: '/' });
  });

  it('setAll stays silent where writing is blocked, as in a Server Component', async () => {
    state.cookieStore = makeCookieStore({ throwOnSet: true });
    await createClient();

    expect(() => state.options.cookies.setAll([{ name: 'a', value: '1' }])).not.toThrow();
  });
});

describe('getServerUser', () => {
  it('maps claims into id and email', async () => {
    state.auth.getClaims = vi.fn(async () => ({
      data: { claims: { sub: 'u1', email: 'a@b.c' } },
      error: null,
    }));

    await expect(getServerUser()).resolves.toEqual({ id: 'u1', email: 'a@b.c' });
  });

  it('is null when there are no claims', async () => {
    await expect(getServerUser()).resolves.toBeNull();
  });

  it('is null when an error comes back', async () => {
    state.auth.getClaims = vi.fn(async () => ({
      data: { claims: { sub: 'u1' } },
      error: { message: 'expired' },
    }));

    await expect(getServerUser()).resolves.toBeNull();
  });
});
