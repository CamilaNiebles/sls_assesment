import { create, findByUser } from '../notes.service.js';
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

describe('Notes Service - findByUser', () => {
  const mockFindByUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (NotesRepository as jest.Mock).mockImplementation(() => ({
      findByUser: mockFindByUser,
    }));
  });

  it('should return notes for a given cognitoId', async () => {
    const cognitoId = 'cognito-123';

    const notes = [
      {
        id: 'note-1',
        cognitoId,
        title: 'Note 1',
        content: 'Content 1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    mockFindByUser.mockResolvedValue(notes);

    const result = await findByUser(cognitoId);

    expect(mockFindByUser).toHaveBeenCalledTimes(1);
    expect(mockFindByUser).toHaveBeenCalledWith(cognitoId);
    expect(result).toEqual(notes);
  });

  it('should return 400 error when cognitoId is missing', async () => {
    const result = await findByUser('');

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        message: 'cognitoId is required',
      }),
    });
  });

  it('should return an error response when repository fails', async () => {
    const cognitoId = 'cognito-123';

    mockFindByUser.mockRejectedValue({
      statusCode: 500,
      message: 'DB error',
    });

    const result = await findByUser(cognitoId);

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        message: 'DB error',
      }),
    });
  });
});
