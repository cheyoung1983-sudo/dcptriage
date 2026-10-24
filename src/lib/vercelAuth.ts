// src/lib/vercelAuth.ts
// Stub implementation for Vercel OIDC token handling.
// Replace the placeholder logic with your actual token exchange/refresh code.

/**
 * Exchange an Auth0 authorization code for a Vercel token.
 * @param code Authorization code received from Auth0.
 * @returns Access token string.
 */
/**
 * Exchange an Auth0 authorization code for a Vercel token.
 * @param code Authorization code received from Auth0.
 * @returns Access token string.
 */
export async function exchangeCodeForToken(code: string): Promise<any> {
  // Using Vercel OIDC token exchange endpoint
  const response = await fetch('https://api.vercel.com/v1/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.VERCEL_CLIENT_ID ?? '',
      client_secret: process.env.VERCEL_CLIENT_SECRET ?? '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.VERCEL_REDIRECT_URI ?? '',
    }),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${await response.text()}`);
  }

  return response.json();
}

/**
 * Refresh a Vercel token using the OIDC provider.
 * @param refreshToken Refresh token issued by Vercel OIDC.
 * @returns New access token string.
 */
export async function refreshVercelToken(refreshToken: string): Promise<any> {
  const response = await fetch('https://api.vercel.com/v1/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.VERCEL_CLIENT_ID ?? '',
      client_secret: process.env.VERCEL_CLIENT_SECRET ?? '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${await response.text()}`);
  }

  return response.json();
}

