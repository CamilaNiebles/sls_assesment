import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { AuthenticatedRequestContext } from '../config/utils.js';
import { deleteById } from '../services/notes.service.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  try {
    const data = validateData(event);
    await deleteById(data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Note deleted successfully',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error: any) {
    return {
      statusCode: error.statusCode ?? 500,
      body: JSON.stringify({
        message: error.message ?? 'Internal server error',
      }),
    };
  }
};

const validateData = (event: APIGatewayProxyEventV2) => {
  const context = event.requestContext as AuthenticatedRequestContext;
  const cognitoId = context.authorizer?.principalId || '';

  const id = event.pathParameters?.id;

  if (!id) {
    throw {
      statusCode: 400,
      message: 'Note id is required',
    };
  }

  return {
    cognitoId,
    id,
  };
};
