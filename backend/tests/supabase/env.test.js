import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const loadEnv = () => import('../../lib/supabase/env');

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('SUPABASE_URL', () => {
  it('reads NEXT_PUBLIC_SUPABASE_URL as-is', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co');

    const { SUPABASE_URL } = await loadEnv();

    expect(SUPABASE_URL).toBe('https://abc.supabase.co');
  });
});

describe('SUPABASE_PUBLISHABLE_KEY', () => {
  it('prefers the publishable key', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_new');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'legacy_anon');

    const { SUPABASE_PUBLISHABLE_KEY } = await loadEnv();

    expect(SUPABASE_PUBLISHABLE_KEY).toBe('sb_publishable_new');
  });

  it('falls back to the anon key when the publishable key is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'legacy_anon');

    const { SUPABASE_PUBLISHABLE_KEY } = await loadEnv();

    expect(SUPABASE_PUBLISHABLE_KEY).toBe('legacy_anon');
  });
});

describe('assertSupabaseEnv', () => {
  it('passes quietly when both are set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_x');

    const { assertSupabaseEnv } = await loadEnv();

    expect(() => assertSupabaseEnv()).not.toThrow();
  });

  it('throws with .env.local guidance when the url is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_x');

    const { assertSupabaseEnv } = await loadEnv();

    expect(() => assertSupabaseEnv()).toThrowError(/\.env\.local/);
  });

  it('throws when the key is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

    const { assertSupabaseEnv } = await loadEnv();

    expect(() => assertSupabaseEnv()).toThrowError(/환경변수가 없습니다/);
  });
});
