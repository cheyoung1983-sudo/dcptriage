import { NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/vercelAuth';

/**
 * GET /api/auth/callback
 * Handles the OAuth callback from Vercel. Expects a `code` query param.
 * Exchanges the authorization code for an access token and returns it as JSON.
 * In a real app you would store the token in a secure HttpOnly cookie or session.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) {
    return new NextResponse('Missing authorization code', { status: 400 });
  }

  try {
    const token = await exchangeCodeForToken(code);
    const response = NextResponse.json(token);
    // Set HttpOnly cookies for token data (expires with access token)
    const maxAge = (token as any).expires_in ?? 3600; // seconds
    response.cookies.set({
      name: 'nextauth.session-token',
      value: (token as any).access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });
    response.cookies.set({
      name: 'nextauth.refresh-token',
      value: (token as any).refresh_token ?? '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // refresh token typically longer-lived; set 30 days
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch (err) {
    console.error('Token exchange error:', err);
    return new NextResponse('Token exchange failed', { status: 500 });
  }
}
