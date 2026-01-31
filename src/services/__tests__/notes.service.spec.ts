import {
  create,
  deleteById,
  DeleteNoteInput,
  findByUser,
  updateByUser,
  UpdateNoteInput,
} from '../notes.service.js';
import { Note, NotesRepository } from '../../repositories/notes.repository.js';
import { randomUUID } from 'crypto';
import { resolveUserId } from '../../config/utils.js';

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

describe('Notes Service - updateByUser', () => {
  const mockUpdateByUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (NotesRepository as jest.Mock).mockImplementation(() => ({
      updateByUser: mockUpdateByUser,
    }));
  });

  it('should update a note successfully', async () => {
    const input: UpdateNoteInput = {
      cognitoId: resolveUserId()!,
      id: 'note-123',
      title: 'Updated title',
      content: 'Updated content',
    };

    mockUpdateByUser.mockResolvedValue({
      id: input.id,
      cognitoId: input.cognitoId,
      title: input.title,
      content: input.content,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: expect.any(String),
    });

    const result = await updateByUser(input);

    expect(mockUpdateByUser).toHaveBeenCalledTimes(1);

    expect(mockUpdateByUser).toHaveBeenCalledWith(input.cognitoId, input.id, {
      title: input.title,
      content: input.content,
    });

    expect(result).toMatchObject({
      id: input.id,
      cognitoId: input.cognitoId,
      title: input.title,
      content: input.content,
    });
  });

  it('should update only title (partial update)', async () => {
    const input: UpdateNoteInput = {
      cognitoId: resolveUserId()!,
      id: 'note-123',
      title: 'Updated title',
    };

    mockUpdateByUser.mockResolvedValue({
      id: input.id,
      cognitoId: input.cognitoId,
      title: input.title,
      content: 'Existing content',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: expect.any(String),
    });

    const result = (await updateByUser(input)) as Note;

    expect(mockUpdateByUser).toHaveBeenCalledWith(input.cognitoId, input.id, {
      title: input.title,
    });

    expect(result?.title).toBe(input.title);
  });

  it('should return an error response when repository fails', async () => {
    const input: UpdateNoteInput = {
      cognitoId: resolveUserId()!,
      id: 'note-123',
      title: 'Updated title',
    };

    mockUpdateByUser.mockRejectedValue(new Error('DB error'));

    const result = await updateByUser(input as any);

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        message: 'DB error',
      }),
    });
  });
});

describe('Notes Service - deleteById', () => {
  const mockDeleteById = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (NotesRepository as jest.Mock).mockImplementation(() => ({
      deleteById: mockDeleteById,
    }));
  });

  it('should delete a note successfully', async () => {
    const input: DeleteNoteInput = {
      cognitoId: resolveUserId()!,
      id: 'note-123',
    };

    mockDeleteById.mockResolvedValue(undefined);

    const result = await deleteById(input);

    expect(mockDeleteById).toHaveBeenCalledTimes(1);
    expect(mockDeleteById).toHaveBeenCalledWith(input.cognitoId, input.id);

    expect(result).toEqual({
      message: 'Note deleted successfully',
    });
  });

  it('should return an error response when repository fails', async () => {
    const input: DeleteNoteInput = {
      cognitoId: resolveUserId()!,
      id: 'note-123',
    };

    mockDeleteById.mockRejectedValue(new Error('DB error'));

    const result = await deleteById(input);

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        message: 'DB error',
      }),
    });
  });
});
