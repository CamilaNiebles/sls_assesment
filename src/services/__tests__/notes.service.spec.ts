import { create } from '../notes.service.js';
import { NotesRepository } from '../../repositories/notes.repository.js';
import { randomUUID } from 'crypto';

jest.mock('../../repositories/notes.repository.js');
jest.mock('crypto');

describe('Notes Service - create', () => {
  const mockCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (NotesRepository as jest.Mock).mockImplementation(() => ({
      create: mockCreate,
    }));

    (randomUUID as jest.Mock).mockReturnValue('uuid-123');
  });

  it('should create a note successfully', async () => {
    const input = {
      cognitoId: 'cognito-123',
      title: 'My note',
      content: 'Some content',
    };

    mockCreate.mockResolvedValue({
      id: 'uuid-123',
      cognitoId: input.cognitoId,
      title: input.title,
      content: input.content,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    const result = await create(input);

    expect(mockCreate).toHaveBeenCalledTimes(1);

    expect(mockCreate).toHaveBeenCalledWith({
      id: 'uuid-123',
      cognitoId: input.cognitoId,
      title: input.title,
      content: input.content,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    expect(result).toMatchObject({
      id: 'uuid-123',
      cognitoId: input.cognitoId,
      title: input.title,
      content: input.content,
    });
  });

  it('should return an error response when repository fails', async () => {
    const input = {
      cognitoId: 'cognito-123',
      title: 'My note',
      content: 'Some content',
    };

    mockCreate.mockRejectedValue(new Error('DB error'));

    const result = await create(input);

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        message: 'DB error',
      }),
    });
  });
});
