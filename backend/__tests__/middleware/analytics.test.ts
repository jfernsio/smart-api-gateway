import request from 'supertest';
import app from '../../index';
import  client  from '../../src/lib/client';

describe('Analytics Logger', () => {
  it('should log request details', async () => {
    const res = await request(app)
      .post('/api/proxy')
      .send({ method: 'GET', url: 'https://catfact.ninja/fact', headers: {} });

    expect(res.statusCode).toBe(200);
    const logs = await client.lRange('analytics', 0, 0);
    const latest = JSON.parse(logs[0]);
    expect(latest.url).toBe('https://catfact.ninja/fact');
    expect(latest.method).toBe('GET');
  });
});
