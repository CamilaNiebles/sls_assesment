import { DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { dynamoDbClient } from '../database/dynamodb.client.js';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  timestamp: string;
  dependencies?: {
    database?: 'ok' | 'down';
  };
}

export const getHealthStatus = async (): Promise<HealthStatus> => {
  let databaseStatus: 'ok' | 'down' = 'ok';
  try {
    await dynamoDbClient.send(
      new DescribeTableCommand({
        TableName: process.env.NOTES_TABLE_NAME,
      }),
    );
  } catch (error) {
    console.error('DynamoDB health check failed', error);
    databaseStatus = 'down';
  }

  return {
    status: databaseStatus === 'ok' ? 'ok' : 'degraded',
    service: 'notes-api',
    timestamp: new Date().toISOString(),
    dependencies: {
      database: databaseStatus,
    },
  };
};
