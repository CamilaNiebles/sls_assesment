import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent } from 'aws-lambda';
import { env } from '../config/env.js';

const USER_POOL_ID = env.USER_POOL_ID;
const COGNITO_CLIENT_ID = env.COGNITO_CLIENT_ID;
const AWS_REGION = env.AWS_REGION;
const IS_OFFLINE = env.IS_OFFLINE;
const DEV_FALLBACK_COGNITO_ID = 'ba1cc3ea-a322-47d7-8d91-338df96563f9';

const ISSUER = `https://cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}`;

export const handler = async (event: APIGatewayTokenAuthorizerEvent) => {
  return generatePolicy({
    principalId: DEV_FALLBACK_COGNITO_ID,
    effect: 'Allow',
    methodArn: event.methodArn,
  });
};

function generatePolicy({
  principalId,
  effect,
  methodArn,
  context,
}: {
  principalId: string;
  effect: 'Allow' | 'Deny';
  methodArn: string;
  context?: Record<string, string>;
}): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: methodArn,
        },
      ],
    },
    context,
  };
}
