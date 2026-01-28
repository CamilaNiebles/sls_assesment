import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { getHealthStatus } from '../services/health.service.js';

export const handler: APIGatewayProxyHandler = async (): Promise<APIGatewayProxyResult> => {
  const healthStatus = await getHealthStatus();

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(healthStatus),
  };
};
