import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent } from 'aws-lambda';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { env } from '../config/env.js';

const USER_POOL_ID = env.USER_POOL_ID;
const COGNITO_CLIENT_ID = env.COGNITO_CLIENT_ID;
const AWS_REGION = env.AWS_REGION;
const IS_OFFLINE = env.IS_OFFLINE;

const DEV_FALLBACK_COGNITO_ID = 'ba1cc3ea-a322-47d7-8d91-338df96563f9';

const ISSUER = `https://cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}`;
const JWKS_URI = `${ISSUER}/.well-known/jwks.json`;

const jwks = createRemoteJWKSet(new URL(JWKS_URI));

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent,
): Promise<APIGatewayAuthorizerResult> => {
  if (IS_OFFLINE) {
    return allow(event.methodArn, DEV_FALLBACK_COGNITO_ID);
  }

  try {
    const token = extractToken(event.authorizationToken);

    const response = await jwtVerify(token, jwks, {
      issuer: ISSUER,
      audience: COGNITO_CLIENT_ID,
    });

    const payload = response.payload;

    return generatePolicy({
      principalId: payload.sub!,
      effect: 'Allow',
      methodArn: event.methodArn,
      context: {
        cognitoId: payload.sub!,
        email: payload.email as string,
      },
    });
  } catch (error) {
    console.error('Authorizer error:', error);
    return deny(event.methodArn);
  }
};

function extractToken(header?: string): string {
  if (!header?.startsWith('Bearer ')) {
    throw new Error('Invalid Authorization header');
  }
  return header.replace('Bearer ', '');
}

function allow(methodArn: string, cognitoId: string) {
  return generatePolicy({
    principalId: cognitoId,
    effect: 'Allow',
    methodArn,
    context: { cognitoId },
  });
}

function deny(methodArn: string) {
  return generatePolicy({
    principalId: 'unauthorized',
    effect: 'Deny',
    methodArn,
  });
}

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
