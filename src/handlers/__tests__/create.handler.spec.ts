import { create } from '../../services/notes.service.js';
import { randomUUID } from 'crypto';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { handler } from '../create.js';
import { resolveUserId } from '../../config/utils.js';

jest.mock('../../services/notes.service.js');
jest.mock('crypto');

describe('Notes Handler - create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (randomUUID as jest.Mock).mockReturnValue(resolveUserId());
  });

  const baseEvent = {
    version: '2.0',
    routeKey: 'POST /notes',
    rawPath: '/notes',
    rawQueryString: '',
    headers: {},
    requestContext: {},
    isBase64Encoded: false,
  } as Partial<APIGatewayProxyEventV2>;

  it('should return 201 when note is created', async () => {
    (create as jest.Mock).mockResolvedValue({
      id: 'note-1',
      cognitoId: resolveUserId(baseEvent as APIGatewayProxyEventV2),
      title: 'Test',
      content: 'Content',
      createdAt: 'now',
      updatedAt: 'now',
    });

    const event = {
      ...baseEvent,
      body: JSON.stringify({
        title: 'Test',
        content: 'Content',
      }),
    } as APIGatewayProxyEventV2;

    const result = await handler(event);

    expect(create).toHaveBeenCalledWith({
      cognitoId: resolveUserId(event),
      title: 'Test',
      content: 'Content',
    });

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body as string)).toHaveProperty('id');
  });

  it('should return 400 if body is missing', async () => {
    const event = {
      ...baseEvent,
      body: undefined,
    } as APIGatewayProxyEventV2;

    await expect(handler(event)).rejects.toEqual({
      statusCode: 400,
      message: 'Request body is required',
    });
  });

  it('should return 400 if body is invalid JSON', async () => {
    const event = {
      ...baseEvent,
      body: '{ invalid json',
    } as APIGatewayProxyEventV2;

    await expect(handler(event)).rejects.toEqual({
      statusCode: 400,
      message: 'Invalid JSON body',
    });
  });

  it('should return 400 if title or content is missing', async () => {
    const event = {
      ...baseEvent,
      body: JSON.stringify({ title: 'Only title' }),
    } as APIGatewayProxyEventV2;

    await expect(handler(event)).rejects.toEqual({
      statusCode: 400,
      message: 'title and content are required',
    });
  });

  it('should propagate service errors', async () => {
    (create as jest.Mock).mockRejectedValue({
      statusCode: 500,
      message: 'Internal error',
    });

    const event = {
      ...baseEvent,
      body: JSON.stringify({
        title: 'Test',
        content: 'Content',
      }),
    } as APIGatewayProxyEventV2;

    await expect(handler(event)).rejects.toEqual({
      statusCode: 500,
      message: 'Internal error',
    });
  });
});
