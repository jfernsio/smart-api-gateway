// __tests__/proxy.test.ts
import request from 'supertest';
import app from '../index.ts';
import client from '../src/lib/client';

describe('POST /api/proxy', () => {
  afterAll(async () => {
    await client.quit();
  });

  it('should return data from API and cache it', async () => {
    const res = await request(app)
      .post('/api/proxy')
      .send({
        url: 'https://catfact.ninja/fact',
        method: 'GET',
        headers: {},
        body: null,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('fact'); // Cat fact example
  });

  it('should return cached data on second call', async () => {
    const key = encodeURIComponent('GET:https://catfact.ninja/fact');
    const cached = await client.get(key);
    expect(cached).not.toBeNull();
  });
});
