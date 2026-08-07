import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './env';

let warned = false;

export async function updateSession(request) {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    if (!warned) {
      warned = true;
      console.warn(
        '[supabase] .env.local 이 없어 세션 갱신을 건너뜁니다. 로그인 기능은 동작하지 않습니다.'
      );
    }
    return { response: NextResponse.next({ request }), user: null };
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers ?? {}).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  let user = null;
  try {
    const { data } = await supabase.auth.getClaims();
    if (data?.claims) {
      user = { id: data.claims.sub, email: data.claims.email ?? null };
    }
  } catch {
  }

  return { response, user };
}
