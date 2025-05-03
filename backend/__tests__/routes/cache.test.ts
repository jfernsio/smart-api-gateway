import request from 'supertest';
import app from '../../index';
import  client  from '../../src/lib/client';

describe('Cache GET route', () => {
  const key = encodeURIComponent('GET:https://catfact.ninja/fact');

  beforeAll(async () => {
    await client.set(key, JSON.stringify({ msg: 'cached' }));
  });

  it('should return cached response', async () => {
    const res = await request(app).get(`/api/cache/${key}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.value).toEqual({ msg: 'cached' });
  });

  it('should return 404 for unknown key', async () => {
    const res = await request(app).get('/api/cache/unknown:key');
    expect(res.statusCode).toBe(404);
  });
});
