import { APIGatewayEventRequestContextV2, APIGatewayRequestAuthorizerEventV2 } from 'aws-lambda';

const DEV_FALLBACK_COGNITO_ID = 'ba1cc3ea-a322-47d7-8d91-338df96563f9';

export const resolveUserId = (event?: APIGatewayRequestAuthorizerEventV2): string | null => {
  const requestContext = event?.requestContext as AuthenticatedRequestContext;

  const cognitoId = DEV_FALLBACK_COGNITO_ID;

  return cognitoId ?? null;
};

export interface JwtAuthorizerContext {
  principalId: string;
}

export interface AuthenticatedRequestContext extends APIGatewayEventRequestContextV2 {
  authorizer?: JwtAuthorizerContext;
}
