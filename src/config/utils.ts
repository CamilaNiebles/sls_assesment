import { APIGatewayEventRequestContextV2 } from 'aws-lambda';

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
