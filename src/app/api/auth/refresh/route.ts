import { NextResponse } from 'next/server';
import { refreshVercelToken } from '@/lib/vercelAuth';
import { getToken } from 'next-auth/jwt';

/**
 * GET /api/auth/refresh
 * Refreshes the Vercel access token using the stored refresh token.
 * Sets new HttpOnly cookies for the refreshed token.
 */
export async function GET(request: Request) {
  // Retrieve the refresh token from the existing cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const refreshTokenMatch = cookieHeader.match(/nextauth\.refresh-token=([^;]+)/);
  const refreshToken = refreshTokenMatch ? decodeURIComponent(refreshTokenMatch[1]) : null;

  if (!refreshToken) {
    return new NextResponse('No refresh token found', { status: 400 });
  }

  try {
    const token = await refreshVercelToken(refreshToken);
    const response = NextResponse.json(token);
    const maxAge = (token as any).expires_in ?? 3600;
    // Update session token cookie
    response.cookies.set({
      name: 'nextauth.session-token',
      value: (token as any).access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });
    // Keep refresh token cookie (may have been rotated)
    response.cookies.set({
      name: 'nextauth.refresh-token',
      value: (token as any).refresh_token ?? refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch (err) {
    console.error('Refresh token error:', err);
    return new NextResponse('Failed to refresh token', { status: 500 });
  }
}
