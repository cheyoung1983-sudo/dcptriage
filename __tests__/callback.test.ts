/** @jest-environment node */
import { GET } from '@/app/api/auth/callback/route';

describe('Auth Callback API', () => {
  it('should return 400 when code is missing', async () => {
    const res = await GET(new Request('http://localhost/api/auth/callback'));
    expect(res.status).toBe(400);
    expect(await res.text()).toContain('Missing authorization code');
  });
});
