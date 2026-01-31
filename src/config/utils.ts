import { APIGatewayEventRequestContextV2 } from 'aws-lambda';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

const DEV_FALLBACK_COGNITO_ID = 'ba1cc3ea-a322-47d7-8d91-338df96563f9';

export const resolveUserId = (event?: APIGatewayProxyEventV2): string | null => {
  const requestContext = event?.requestContext as AuthenticatedRequestContext;

  const cognitoId = DEV_FALLBACK_COGNITO_ID;

  if (!cognitoId && process.env.STAGE === 'prod') {
    return requestContext?.authorizer?.jwt?.claims?.sub ?? null;
  }

  return cognitoId ?? null;
};
export interface JwtAuthorizerContext {
  jwt?: {
    claims?: {
      sub?: string;
      [key: string]: any;
    };
  };
}

export interface AuthenticatedRequestContext extends APIGatewayEventRequestContextV2 {
  authorizer?: JwtAuthorizerContext;
}
