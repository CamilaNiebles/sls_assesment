import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { handler } from '../getById.js';
import { findByUser } from '../../services/notes.service.js';
import { resolveUserId } from '../../config/utils.js';

jest.mock('../../services/notes.service.js');
jest.mock('../../config/utils.js');

describe('Get notes handler', () => {
  const mockEvent = {
    requestContext: {},
  } as unknown as APIGatewayProxyEventV2;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if cognitoId is missing', async () => {
    (resolveUserId as jest.Mock).mockReturnValue(null);

    const result = await handler(mockEvent);

    expect(result).toEqual({
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' }),
    });

    expect(findByUser).not.toHaveBeenCalled();
  });

  it('should return 200 and notes when service succeeds', async () => {
    const notes = [
      {
        id: 'note-1',
        title: 'Test note',
        content: 'Some content',
      },
    ];

    (resolveUserId as jest.Mock).mockReturnValue('cognito-123');
    (findByUser as jest.Mock).mockResolvedValue(notes);

    const result = await handler(mockEvent);

    expect(findByUser).toHaveBeenCalledTimes(1);
    expect(findByUser).toHaveBeenCalledWith('cognito-123');

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

    (resolveUserId as jest.Mock).mockReturnValue('cognito-123');
    (findByUser as jest.Mock).mockResolvedValue(serviceError);

    const result = await handler(mockEvent);

    expect(result).toEqual(serviceError);
  });

  it('should return 500 if handler throws an unexpected error', async () => {
    (resolveUserId as jest.Mock).mockImplementation(() => {
      throw new Error('Boom');
    });

    const result = await handler(mockEvent);

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
      }),
    });
  });
});
