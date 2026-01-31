import { NotesRepository } from '../repositories/notes.repository.js';
import { randomUUID } from 'crypto';

interface newNote {
  cognitoId: string;
  title: string;
  content: string;
}

export const create = async (data: newNote) => {
  const notesRepository = new NotesRepository();

  try {
    const { cognitoId, title, content } = data;

    const now = new Date().toISOString();

    const note = {
      id: randomUUID(),
      cognitoId,
      title,
      content,
      createdAt: now,
      updatedAt: now,
    };

    const createdNote = await notesRepository.create(note);

    return createdNote;
  } catch (error: any) {
    console.error('Create note failed:', error);

    return {
      statusCode: error.statusCode ?? 500,
      body: JSON.stringify({
        message: error.message ?? 'Internal server error',
      }),
    };
  }
};

export const findByUser = async (cognitoId: string) => {
  const notesRepository = new NotesRepository();

  try {
    if (!cognitoId) {
      throw {
        statusCode: 400,
        message: 'cognitoId is required',
      };
    }

    const notes = await notesRepository.findByUser(cognitoId);

    return notes;
  } catch (error: any) {
    console.error('Find notes by user failed:', error);

    return {
      statusCode: error.statusCode ?? 500,
      body: JSON.stringify({
        message: error.message ?? 'Internal server error',
      }),
    };
  }
};
