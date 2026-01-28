import { getHealthStatus } from '../health.service.js';

describe('getHealthStatus', () => {
  it('should return a valid health status', async () => {
    const result = await getHealthStatus();

    expect(result).toBeDefined();

    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('service');
    expect(result).toHaveProperty('timestamp');

    expect(result.status).toBe('ok');
    expect(result.service).toBe('notes-api');

    expect(() => new Date(result.timestamp).toISOString()).not.toThrow();
  });
});
