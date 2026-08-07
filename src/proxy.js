import { updateSession } from '@backend/lib/supabase/proxy';
import { NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/mypage'];

export async function proxy(request) {
  const { response, user } = await updateSession(request);

  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (needsAuth && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    redirectUrl.search = '';
    redirectUrl.searchParams.set('auth_required', '1');
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
