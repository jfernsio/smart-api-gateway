import  client  from '../../src/lib/client';

describe('Redis Client', () => {
  it('should connect and set/get key', async () => {
    await client.set('test-key', 'test-value');
    const value = await client.get('test-key');
    expect(value).toBe('test-value');
  });

  it('should delete key after expiration', async () => {
    await client.set('expire-key', 'val', { EX: 1 });
    await new Promise((res) => setTimeout(res, 1500));
    const value = await client.get('expire-key');
    expect(value).toBe(null);
  });
});
