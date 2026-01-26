import request from 'supertest';
import express from 'express';
import { healthRouter } from '../health.router.js';

describe('Health Router', () => {
  const app = express();

  beforeAll(() => {
    app.use('/health-check', healthRouter);
  });

  it('should return 200 and OK status', async () => {
    const response = await request(app).get('/health-check');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'OK' });
  });
});
