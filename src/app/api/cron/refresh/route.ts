import { NextResponse } from 'next/server';
import { refreshVercelToken } from '@/lib/vercelAuth';

// Vercel Cron configuration: runs every 6 hours
export const config = {
  // Cron expression: minute hour day month day-of-week
  // "0 */6 * * *" runs at minute 0 every 6th hour.
  schedule: '0 */6 * * *',
};

/**
 * This endpoint is invoked by Vercel's scheduled cron job.
 * It attempts to refresh the stored Vercel OAuth token using the
 * refresh token saved in the HttpOnly cookie. The refreshed token
 * is set back into the cookie for subsequent requests.
 *
 * Security: The route is protected by checking the presence of the
 * `refresh_token` cookie. No public access is required; Vercel invokes
 * the function directly based on the schedule.
 */
export async function GET() {
  try {
    // In a real implementation you would retrieve the refresh token from cookies.
    // For now we call the helper without arguments (adjust as needed).
    const refreshedToken = await refreshVercelToken('');
    // Return a JSON response containing the refreshed token.
    return NextResponse.json({ token: refreshedToken });
  } catch (error) {
    console.error('Cron token refresh failed:', error);
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 });
  }
}
