import { vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'https://e2e.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||= 'sb_publishable_e2e';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= 'sb_anon_e2e';

vi.mock('@backend/lib/supabase/server', async () => {
  const { createSupabase } = await import('./supabase.js');
  const { currentUser } = await import('./session.js');
  return {
    createClient: async () => createSupabase(currentUser()),
    getServerUser: async () => currentUser(),
  };
});

vi.mock('@backend/lib/supabase/client', async () => {
  const { createBrowserSupabase } = await import('./browser.js');
  return { createClient: () => createBrowserSupabase() };
});
