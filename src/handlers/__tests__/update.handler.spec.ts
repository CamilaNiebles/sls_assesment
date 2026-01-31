import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { updateByUser } from '../../services/notes.service.js';
import { resolveUserId } from '../../config/utils.js';
import { handler } from '../update.js';

jest.mock('../../services/notes.service.js');
jest.mock('../../config/utils.js');

describe('Update Note Handler', () => {
  const mockUpdateByUser = updateByUser as jest.Mock;
  const mockResolveUserId = resolveUserId as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseEvent = (): APIGatewayProxyEventV2 =>
    ({
      version: '2.0',
      routeKey: '',
      rawPath: '',
      rawQueryString: '',
      headers: {},
      requestContext: {} as any,
      isBase64Encoded: false,
    }) as APIGatewayProxyEventV2;

  it('should update a note successfully', async () => {
    mockResolveUserId.mockReturnValue('cognito-123');
    mockUpdateByUser.mockResolvedValue({
      id: 'note-123',
      cognitoId: 'cognito-123',
      title: 'Updated title',
      content: 'Updated content',
    });

    const event = {
      ...baseEvent(),
      pathParameters: { id: 'note-123' },
      body: JSON.stringify({
        title: 'Updated title',
        content: 'Updated content',
      }),
    };

    const result = await handler(event);

    expect(mockUpdateByUser).toHaveBeenCalledWith({
      cognitoId: 'cognito-123',
      id: 'note-123',
      title: 'Updated title',
      content: 'Updated content',
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toMatchObject({
      id: 'note-123',
      title: 'Updated title',
    });
  });

  it('should return 401 when user is unauthorized', async () => {
    mockResolveUserId.mockReturnValue(null);
    const event = {
      ...baseEvent(),
      pathParameters: { id: 'note-123' },
      body: JSON.stringify({ title: 'Updated title' }),
    };

    const result = await handler(event);

    expect(result).toEqual({
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' }),
    });
  });

  it('should return 400 when note id is missing', async () => {
    mockResolveUserId.mockReturnValue('cognito-123');
    const event = {
      ...baseEvent(),
      body: JSON.stringify({ title: 'Updated title' }),
    };

    const result = await handler(event);

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({ message: 'Note id is required' }),
    });
  });

  it('should return 400 when request body is missing', async () => {
    mockResolveUserId.mockReturnValue('cognito-123');
    const event = {
      ...baseEvent(),
      pathParameters: { id: 'note-123' },
    };

    const result = await handler(event);

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({ message: 'Request body is required' }),
    });
  });

  it('should return 400 for invalid JSON body', async () => {
    mockResolveUserId.mockReturnValue('cognito-123');
    const event = {
      ...baseEvent(),
      pathParameters: { id: 'note-123' },
      body: '{ invalid json }',
    };

    const result = await handler(event);

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid JSON body' }),
    });
  });

  it('should return 400 when no updatable fields are provided', async () => {
    mockResolveUserId.mockReturnValue('cognito-123');
    const event = {
      ...baseEvent(),
      pathParameters: { id: 'note-123' },
      body: JSON.stringify({}),
    };

    const result = await handler(event);

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        message: 'At least one field (title or content) must be provided',
      }),
    });
  });

  it('should return 500 when service throws unexpectedly', async () => {
    mockResolveUserId.mockReturnValue('cognito-123');
    mockUpdateByUser.mockRejectedValue(new Error('Internal server error'));

    const event = {
      ...baseEvent(),
      pathParameters: { id: 'note-123' },
      body: JSON.stringify({ title: 'Updated title' }),
    };

    const result = await handler(event);

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    });
  });
});
