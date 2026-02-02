import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'local',
    secretAccessKey: 'local',
  },
});

async function createTable() {
  try {
    await client.send(
      new CreateTableCommand({
        TableName: 'notes-api-offline-notes-dev',
        BillingMode: 'PAY_PER_REQUEST',
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' },
          { AttributeName: 'cognitoId', AttributeType: 'S' },
        ],
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'cognitoId-index',
            KeySchema: [{ AttributeName: 'cognitoId', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' },
          },
        ],
      }),
    );

    console.log('✅ Local DynamoDB table created');
  } catch (error: any) {
    if (error.name === 'ResourceInUseException') {
      console.log('ℹ️ Table already exists');
    } else {
      throw error;
    }
  }
}

createTable();
