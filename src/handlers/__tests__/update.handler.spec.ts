import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { updateByUser } from '../../services/notes.service.js';
import { handler } from '../update.js';

jest.mock('../../services/notes.service.js');
jest.mock('../../config/utils.js');

describe('Update Note Handler', () => {
  const mockUpdateByUser = updateByUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });
  const mockEvent = {
    requestContext: {
      authorizer: {
        principalId: 'cognito-123',
      },
    },
  } as unknown as APIGatewayProxyEventV2;

  it('should update a note successfully', async () => {
    mockUpdateByUser.mockResolvedValue({
      id: 'note-123',
      cognitoId: 'cognito-123',
      title: 'Updated title',
      content: 'Updated content',
    });

    const event = {
      ...mockEvent,
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

  it('should return 400 when note id is missing', async () => {
    const event = {
      ...mockEvent,
      body: JSON.stringify({ title: 'Updated title' }),
    };

    const result = await handler(event);

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({ message: 'Note id is required' }),
    });
  });

  it('should return 400 when request body is missing', async () => {
    const event = {
      ...mockEvent,
      pathParameters: { id: 'note-123' },
    };

    const result = await handler(event);

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({ message: 'Request body is required' }),
    });
  });

  it('should return 400 for invalid JSON body', async () => {
    const event = {
      ...mockEvent,
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
    const event = {
      ...mockEvent,
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
    mockUpdateByUser.mockRejectedValue(new Error('Internal server error'));

    const event = {
      ...mockEvent,
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
