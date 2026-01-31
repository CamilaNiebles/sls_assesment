import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { resolveUserId } from '../../config/utils.js';
import { deleteById } from '../../services/notes.service.js';
import { handler } from '../deleteById.js';

jest.mock('../../config/utils.js');
jest.mock('../../services/notes.service.js');

describe('Delete Note Handler', () => {
  const mockResolveUserId = resolveUserId as jest.Mock;
  const mockDeleteById = deleteById as jest.Mock;

  const baseEvent: Partial<APIGatewayProxyEventV2> = {
    version: '2.0',
    routeKey: 'DELETE /notes/{id}',
    rawPath: '/notes/note-123',
    pathParameters: {
      id: 'note-123',
    },
    headers: {},
    requestContext: {} as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a note successfully', async () => {
    mockResolveUserId.mockReturnValue('cognito-123');
    mockDeleteById.mockResolvedValue(undefined);

    const result = await handler(baseEvent as APIGatewayProxyEventV2);

    expect(mockDeleteById).toHaveBeenCalledTimes(1);
    expect(mockDeleteById).toHaveBeenCalledWith({
      cognitoId: 'cognito-123',
      id: 'note-123',
    });

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        message: 'Note deleted successfully',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should return 401 when user is not authenticated', async () => {
    mockResolveUserId.mockReturnValue(null);

    const result = await handler(baseEvent as APIGatewayProxyEventV2);

    expect(mockDeleteById).not.toHaveBeenCalled();
    expect(result).toEqual({
      statusCode: 401,
      body: JSON.stringify({
        message: 'Unauthorized',
      }),
    });
  });

  it('should return 400 when note id is missing', async () => {
    mockResolveUserId.mockReturnValue('cognito-123');

    const eventWithoutId = {
      ...baseEvent,
      pathParameters: {},
    };

    const result = await handler(eventWithoutId as APIGatewayProxyEventV2);

    expect(mockDeleteById).not.toHaveBeenCalled();
    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        message: 'Note id is required',
      }),
    });
  });

  it('should return 500 when deleteById throws an error', async () => {
    mockResolveUserId.mockReturnValue('cognito-123');
    mockDeleteById.mockRejectedValue(new Error('DB error'));

    const result = await handler(baseEvent as APIGatewayProxyEventV2);

    expect(mockDeleteById).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        message: 'DB error',
      }),
    });
  });
});
