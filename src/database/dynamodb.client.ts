import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { env } from '../config/env.js';

export const buildDynamoConfig = () => {
  const isOffline = env.IS_OFFLINE === true;

  return {
    region: env.AWS_REGION,
    ...(isOffline && {
      endpoint: env.DYNAMODB_ENDPOINT,
    }),
  };
};

export const dynamoDbClient = new DynamoDBClient(buildDynamoConfig());
