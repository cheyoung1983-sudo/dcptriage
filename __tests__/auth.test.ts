/** @jest-environment node */
import { GET } from '@/app/api/auth/signin/route';

describe('Auth SignIn API', () => {
  it('should redirect to Vercel OAuth URL', async () => {
    process.env.VERCEL_CLIENT_ID = 'test-client';
    process.env.VERCEL_OAUTH_REDIRECT_URI = 'http://localhost/api/auth/callback';
    const res = await GET();
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('https://api.vercel.com/v2/oauth/authorize');
  });
});
