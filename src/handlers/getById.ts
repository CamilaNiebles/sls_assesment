import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { AuthenticatedRequestContext } from '../config/utils.js';
import { findByUser } from '../services/notes.service.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const requestContext = event.requestContext as AuthenticatedRequestContext;
    const cognitoId = 'ba1cc3ea-a322-47d7-8d91-338df96563f9';

    if (!cognitoId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }

    const result = await findByUser(cognitoId);

    // En caso de que el service retorne error HTTP-like
    if ((result as any)?.statusCode) {
      return result as APIGatewayProxyResultV2;
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result),
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
