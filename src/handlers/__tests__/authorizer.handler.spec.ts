import { handler } from '../authorizer.js';
import type { APIGatewayTokenAuthorizerEvent } from 'aws-lambda';

describe('Authorizer handler', () => {
  const baseEvent: APIGatewayTokenAuthorizerEvent = {
    type: 'TOKEN',
    authorizationToken: 'Bearer fake-token',
    methodArn: 'arn:aws:execute-api:us-east-1:123456789012:abcdef/dev/GET/notes',
  };

  it('should return an Allow policy with fallback cognito id', async () => {
    const result = await handler(baseEvent);

    expect(result).toBeDefined();
    expect(result.principalId).toBe('ba1cc3ea-a322-47d7-8d91-338df96563f9');

    expect(result.policyDocument.Version).toBe('2012-10-17');
    expect(result.policyDocument.Statement).toHaveLength(1);

    const statement = result.policyDocument.Statement[0];

    expect(statement.Effect).toBe('Allow');
  });
});
