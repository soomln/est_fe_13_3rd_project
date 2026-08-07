import { createBrowserClient } from '@supabase/ssr';

import { assertSupabaseEnv, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './env';

let browserClient = null;

export function createClient() {
  if (browserClient) return browserClient;

  assertSupabaseEnv();
  browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  return browserClient;
}
