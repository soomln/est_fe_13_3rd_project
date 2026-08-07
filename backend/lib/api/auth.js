import { createClient } from '../supabase/client';
import { apiFetch } from './_fetch';
import { ApiError } from './errors';

export const OAUTH_PROVIDERS = [
  { id: 'github', label: 'GitHub', isEnabled: true },
  { id: 'google', label: 'Google', isEnabled: true },
  { id: 'kakao', label: '카카오', isEnabled: true },
];

export async function signInWith(provider, { next = '/' } = {}) {
  if (typeof window === 'undefined') {
    throw new ApiError('signInWith 는 브라우저에서만 호출할 수 있습니다.');
  }

  const supabase = createClient();
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  if (error) {
    throw new ApiError(`${provider} 로그인을 시작하지 못했습니다: ${error.message}`, {
      cause: error,
    });
  }
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new ApiError(`로그아웃에 실패했습니다: ${error.message}`, { cause: error });
}

export async function getCurrentUser() {
  const { user } = await apiFetch('/api/me');
  return user;
}

export function onAuthChange(handler) {
  const supabase = createClient();
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    handler(
      session?.user ? { id: session.user.id, email: session.user.email ?? null } : null
    );
  });

  return () => subscription.unsubscribe();
}

export async function deleteMyAccount() {
  await apiFetch('/api/me', { method: 'DELETE' });
  await signOut();
}
