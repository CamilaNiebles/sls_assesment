import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { env } from '../config/env.js';

const isOffline = env.IS_OFFLINE === true;
const dynamoHost = env.DYNAMODB_ENDPOINT || 'http://localhost:8000';

export const dynamoDbClient = new DynamoDBClient({
  region: env.AWS_REGION || 'us-east-1',
  ...(isOffline && {
    endpoint: dynamoHost,
  }),
});
