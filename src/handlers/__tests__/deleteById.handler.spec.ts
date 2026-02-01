import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { deleteById } from '../../services/notes.service.js';
import { handler } from '../deleteById.js';

jest.mock('../../config/utils.js');
jest.mock('../../services/notes.service.js');

describe('Delete Note Handler', () => {
  const mockDeleteById = deleteById as jest.Mock;

  const mockEvent = {
    pathParameters: {
      id: 'note-123',
    },
    requestContext: {
      authorizer: {
        principalId: 'cognito-123',
      },
    },
  } as unknown as APIGatewayProxyEventV2;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a note successfully', async () => {
    mockDeleteById.mockResolvedValue(undefined);

    const result = await handler(mockEvent as APIGatewayProxyEventV2);

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

  it('should return 400 when note id is missing', async () => {
    const eventWithoutId = {
      ...mockEvent,
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
    mockDeleteById.mockRejectedValue(new Error('DB error'));

    const result = await handler(mockEvent as APIGatewayProxyEventV2);

    expect(mockDeleteById).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        message: 'DB error',
      }),
    });
  });
});
