import request from 'supertest';
import app from '../../index'; 

describe('Rate Limiter Middleware', () => {
  it('should allow under limit', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
    }
  });

  it('should block over limit', async () => {
    const ip = 'test-ip';
    for (let i = 0; i < 101; i++) {
      await request(app).get('/api/health').set('x-real-ip', ip);
    }
    const res = await request(app).get('/api/health').set('x-real-ip', ip);
    expect(res.statusCode).toBe(403);
  });
});
