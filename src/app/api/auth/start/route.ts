import { NextResponse } from 'next/server';
import { startAuthorization } from '@vercel/connect';

/**
 * GET /api/auth/start
 * Redirects the user to Vercel's OAuth authorization page.
 *
 * Expected query param:
 *   - userId (optional): Vercel user ID to authorize. Defaults to a placeholder.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId') ?? 'usr_123';

  // startAuthorization returns a Promise<string> – await it to get a proper URL
  const { url: authUrl } = await startAuthorization('mcp.vercel.com/sky-mountain', {
    // clientId: process.env.VERCEL_CLIENT_ID,
    // clientSecret: process.env.VERCEL_CLIENT_SECRET,
    subject: { type: 'user', id: userId },
    scopes: ['openid', 'email', 'profile'],
  });

  return NextResponse.redirect(authUrl);
}
