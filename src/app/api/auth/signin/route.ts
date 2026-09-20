import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.VERCEL_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.VERCEL_OAUTH_REDIRECT_URI!);
  const scope = encodeURIComponent('openid email profile');
  const authUrl = `https://api.vercel.com/v2/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  return NextResponse.redirect(authUrl);
}
