import { updateSession } from '@backend/lib/supabase/proxy';
import { NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/mypage', '/interview/chat'];

const BACKEND_TEST_PATH = '/backend-test';

const backendTestOpen =
  process.env.NODE_ENV !== 'production' || process.env.ENABLE_BACKEND_TEST === '1';

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const isBackendTest =
    pathname === BACKEND_TEST_PATH || pathname.startsWith(`${BACKEND_TEST_PATH}/`);
  if (isBackendTest && !backendTestOpen) {
    return new NextResponse(null, { status: 404 });
  }

  const { response, user } = await updateSession(request);

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
