import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { handler } from '../getById.js';
import { findByUser } from '../../services/notes.service.js';

jest.mock('../../services/notes.service.js');
jest.mock('../../config/utils.js');

describe('Get notes handler', () => {
  const mockEvent = {
    requestContext: {
      authorizer: {
        principalId: 'cognito-123',
      },
    },
  } as unknown as APIGatewayProxyEventV2;

  const mockFindByUser = findByUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and notes when service succeeds', async () => {
    const notes = [
      {
        id: 'note-1',
        title: 'Test note',
        content: 'Some content',
      },
    ];

    mockFindByUser.mockResolvedValue(notes);

    const result = await handler(mockEvent);

    expect(mockFindByUser).toHaveBeenCalledTimes(1);
    expect(mockFindByUser).toHaveBeenCalledWith('cognito-123');

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        data: notes,
        count: notes.length,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should return service error response if service returns HTTP-like error', async () => {
    const serviceError = {
      statusCode: 400,
      body: JSON.stringify({ message: 'Bad request' }),
    };

    mockFindByUser.mockResolvedValue(serviceError);

    const result = await handler(mockEvent);

    expect(result).toEqual(serviceError);
  });
  it('should return 500 if handler throws an unexpected error', async () => {
    mockFindByUser.mockRejectedValue(new Error('Internal server error'));

    const result = await handler(mockEvent);

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
      }),
    });
  });
});
