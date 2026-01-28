import { handler } from '../health.js';
import * as healthService from '../../services/health.service.js';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Callback, Context } from 'aws-lambda';

describe('Health Handler', () => {
  it('should return 200 and health payload', async () => {
    const mockHealth: healthService.HealthStatus = {
      status: 'ok',
      service: 'notes-api',
      timestamp: '2026-01-01T00:00:00.000Z',
    };

    jest.spyOn(healthService, 'getHealthStatus').mockResolvedValue(mockHealth);

    const response = await handler(
      {} as APIGatewayProxyEvent,
      {} as Context,
      {} as Callback<APIGatewayProxyResult>,
    );

    expect(response?.statusCode).toBe(200);
    expect(response?.body).toBe(JSON.stringify(mockHealth));
  });
});
