import { createClient } from '@backend/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  const oauthError = searchParams.get('error_description') ?? searchParams.get('error');
  if (oauthError) {
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(oauthError)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/?auth_error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(error.message)}`);
  }

  const destination = new URL(next, origin);
  if (destination.origin !== origin) {
    return NextResponse.redirect(origin);
  }

  return NextResponse.redirect(destination);
}
