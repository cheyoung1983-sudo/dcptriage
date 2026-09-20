import request from 'supertest';
import { createServer } from 'http';
import { handler } from '@/app/api/auth/signin/route'; // adjust import if needed

describe('Auth SignIn API', () => {
  let server: any;
  beforeAll(() => {
    server = createServer(handler);
  });

  it('should redirect to Vercel OAuth URL', async () => {
    const res = await request(server).get('/api/auth/signin');
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('https://vercel.com/oauth/authorize');
  });
});
