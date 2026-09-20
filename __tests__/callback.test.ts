import request from 'supertest';
import { createServer } from 'http';
import { handler as callbackHandler } from '@/app/api/auth/callback/route';

describe('Auth Callback API', () => {
  let server: any;
  beforeAll(() => {
    server = createServer(callbackHandler);
  });

  it('should return 400 when code is missing', async () => {
    const res = await request(server).get('/api/auth/callback');
    expect(res.status).toBe(400);
    expect(res.text).toContain('Missing authorization code');
  });
});
