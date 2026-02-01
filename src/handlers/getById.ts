import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { findByUser } from '../services/notes.service.js';
import { AuthenticatedRequestContext } from '../config/utils.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const context = event.requestContext as AuthenticatedRequestContext;
    const cognitoId = context.authorizer?.principalId || '';

    const result = await findByUser(cognitoId);
    if ((result as any)?.statusCode) {
      return result as APIGatewayProxyResultV2;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: result,
        count: Array.isArray(result) ? result.length : 0,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error: any) {
    console.error('Get notes handler failed:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
      }),
    };
  }
};
