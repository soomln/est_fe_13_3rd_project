import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn((url, key) => ({ kind: 'browser', url, key })),
}));

const { createBrowserClient } = await import('@supabase/ssr');

beforeEach(() => {
  vi.resetModules();
  createBrowserClient.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('createClient', () => {
  it('builds the browser client from the env vars', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_x');

    const { createClient } = await import('../../lib/supabase/client');
    const client = createClient();

    expect(createBrowserClient).toHaveBeenCalledWith('https://abc.supabase.co', 'sb_publishable_x');
    expect(client).toEqual({
      kind: 'browser',
      url: 'https://abc.supabase.co',
      key: 'sb_publishable_x',
    });
  });

  it('reuses the same instance from the second call on', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_x');

    const { createClient } = await import('../../lib/supabase/client');

    expect(createClient()).toBe(createClient());
    expect(createBrowserClient).toHaveBeenCalledTimes(1);
  });

  it('throws before building when the env vars are missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

    const { createClient } = await import('../../lib/supabase/client');

    expect(() => createClient()).toThrowError(/환경변수가 없습니다/);
    expect(createBrowserClient).not.toHaveBeenCalled();
  });
});
