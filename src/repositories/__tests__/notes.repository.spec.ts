import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { PutCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { NotesRepository, Note } from '../notes.repository.js';

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: jest.fn(),
    },
  };
});

describe('NotesRepository', () => {
  const sendMock = jest.fn();
  let repository: NotesRepository;

  const note: Note = {
    id: 'note-1',
    cognitoId: 'user-1',
    title: 'Test note',
    content: 'Hello world',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (DynamoDBDocumentClient.from as jest.Mock).mockReturnValue({
      send: sendMock,
    });

    repository = new NotesRepository();
  });

  describe('create', () => {
    it('should create a note', async () => {
      sendMock.mockResolvedValue({});

      const result = await repository.create(note);

      expect(sendMock).toHaveBeenCalledWith(expect.any(PutCommand));

      expect(result).toEqual(note);
    });

    it('should throw when creation fails', async () => {
      sendMock.mockRejectedValue(new Error('DynamoDB error'));

      await expect(repository.create(note)).rejects.toThrow('Failed to create note');
    });
  });

  describe('findByUser', () => {
    it('should return notes for a user', async () => {
      sendMock.mockResolvedValue({
        Items: [note],
      });

      const result = await repository.findByUser('user-1');

      expect(sendMock).toHaveBeenCalledWith(expect.any(QueryCommand));

      expect(result).toEqual([note]);
    });

    it('should throw when query fails', async () => {
      sendMock.mockRejectedValue(new Error('Query failed'));

      await expect(repository.findByUser('user-1')).rejects.toThrow(
        'Failed to find notes for user',
      );
    });
  });

  describe('update', () => {
    const getUpdateCommandInput = () => {
      const call = sendMock.mock.calls[0][0] as UpdateCommand;
      return call.input;
    };
    it('should update a note', async () => {
      sendMock.mockResolvedValue({
        Attributes: note,
      });

      const result = await repository.updateByUser(note.cognitoId, note.id, {
        title: note.title,
        content: note.content,
      });

      expect(sendMock).toHaveBeenCalledTimes(1);
      expect(sendMock).toHaveBeenCalledWith(expect.any(UpdateCommand));

      const input = getUpdateCommandInput();

      expect(input).toMatchObject({
        TableName: expect.any(String),
        Key: {
          cognitoId: note.cognitoId,
          id: note.id,
        },
        ReturnValues: 'ALL_NEW',
      });

      expect(input.UpdateExpression).toContain('#title = :title');
      expect(input.UpdateExpression).toContain('#content = :content');
      expect(input.UpdateExpression).toContain('#updatedAt = :updatedAt');

      expect(input.ExpressionAttributeNames).toMatchObject({
        '#title': 'title',
        '#content': 'content',
        '#updatedAt': 'updatedAt',
      });

      expect(input.ExpressionAttributeValues).toMatchObject({
        ':title': note.title,
        ':content': note.content,
        ':updatedAt': expect.any(String),
      });

      expect(result).toEqual(note);
    });

    it('updates only title when content is undefined', async () => {
      sendMock.mockResolvedValueOnce({
        Attributes: { id: '1', title: 'new', updatedAt: 'now' },
      });

      await repository.updateByUser('user-1', '1', { title: 'new' });
      const input = sendMock.mock.calls[0][0].input;

      expect(input.UpdateExpression).toContain('#title');
      expect(input.UpdateExpression).not.toContain('#content');
    });

    it('updates only content when title is undefined', async () => {
      sendMock.mockResolvedValueOnce({
        Attributes: { id: '1', content: 'new', updatedAt: 'now' },
      });

      await repository.updateByUser('user-1', '1', { content: 'new' });
      const input = sendMock.mock.calls[0][0].input;

      expect(input.UpdateExpression).toContain('#content');
      expect(input.UpdateExpression).not.toContain('#title');
    });

    it('should throw when update fails', async () => {
      sendMock.mockRejectedValue(new Error('Update failed'));

      await expect(
        repository.updateByUser(note.cognitoId, note.id, {
          title: note.title,
          content: note.content,
        }),
      ).rejects.toThrow('Failed to update note');
    });
  });

  describe('deleteById', () => {
    it('should delete a note', async () => {
      sendMock.mockResolvedValue({});

      await repository.deleteById('user-1', 'note-1');

      expect(sendMock).toHaveBeenCalledWith(expect.any(DeleteCommand));
    });

    it('should throw when delete fails', async () => {
      sendMock.mockRejectedValue(new Error('Delete failed'));

      await expect(repository.deleteById('user-1', 'note-1')).rejects.toThrow(
        'Failed to delete note',
      );
    });
  });
});
