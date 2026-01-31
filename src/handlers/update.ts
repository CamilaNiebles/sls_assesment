import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { resolveUserId } from '../config/utils.js';
import { updateByUser, UpdateNoteInput } from '../services/notes.service.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  try {
    const data: UpdateNoteInput = validateData(event);
    const updatedNote = await updateByUser(data);

    return {
      statusCode: 200,
      body: JSON.stringify(updatedNote),
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
  const cognitoId = resolveUserId(event);

  if (!cognitoId) {
    throw {
      statusCode: 401,
      message: 'Unauthorized',
    };
  }

  const id = event.pathParameters?.id;

  if (!id) {
    throw {
      statusCode: 400,
      message: 'Note id is required',
    };
  }

  if (!event.body) {
    throw {
      statusCode: 400,
      message: 'Request body is required',
    };
  }

  let parsedBody: any;

  try {
    parsedBody = JSON.parse(event.body);
  } catch {
    throw {
      statusCode: 400,
      message: 'Invalid JSON body',
    };
  }

  const { title, content } = parsedBody;

  if (title === undefined && content === undefined) {
    throw {
      statusCode: 400,
      message: 'At least one field (title or content) must be provided',
    };
  }

  return {
    cognitoId,
    id,
    ...(title !== undefined && { title }),
    ...(content !== undefined && { content }),
  };
};
