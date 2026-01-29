import { getHealthStatus } from '../health.service.js';
import { dynamoDbClient } from '../../database/dynamodb.client.js';

describe('getHealthStatus', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return ok when DynamoDB is reachable', async () => {
    jest.spyOn(dynamoDbClient, 'send').mockImplementation(async () => ({}));

    const result = await getHealthStatus();

    expect(result).toMatchObject({
      status: 'ok',
      service: 'notes-api',
      dependencies: {
        database: 'ok',
      },
    });

    expect(() => new Date(result.timestamp).toISOString()).not.toThrow();
  });

  it('should return degraded when DynamoDB is not reachable', async () => {
    jest
      .spyOn(dynamoDbClient, 'send')
      .mockImplementation(() => Promise.reject(new Error('DynamoDB error')));

    const result = await getHealthStatus();

    expect(result).toMatchObject({
      status: 'degraded',
      service: 'notes-api',
      dependencies: {
        database: 'down',
      },
    });
  });
});
