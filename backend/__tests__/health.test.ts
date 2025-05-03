import request from 'supertest';
import app from '../index';

describe('Health Check Route', () => {
  it('should return 200 OK and health message', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Redis is healthy');
  });
});
