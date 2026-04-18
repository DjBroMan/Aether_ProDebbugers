import request from 'supertest';
import app from '../app';

describe('Aether Backend Verification', () => {
  it('should successfully hit the health check endpoint', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Aether Backend Online');
  });

  it('should deny access to protected routes without a token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });
});
