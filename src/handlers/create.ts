import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { create } from '../services/notes.service.js';
import { randomUUID } from 'crypto';
import { AuthenticatedRequestContext } from '../config/utils.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  const data = validateData(event);
  const createdNote = await create(data);
  return {
    statusCode: 201,
    body: JSON.stringify(createdNote),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

const validateData = (event: APIGatewayProxyEventV2) => {
  const requestContext = event.requestContext as AuthenticatedRequestContext;
  const cognitoId = randomUUID();

  if (!cognitoId) {
    throw {
      statusCode: 401,
      message: 'Unauthorized',
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

  if (!title || !content) {
    throw {
      statusCode: 400,
      message: 'title and content are required',
    };
  }

  return {
    cognitoId,
    title,
    content,
  };
};
