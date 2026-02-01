import { NotesRepository } from '../repositories/notes.repository.js';
import { randomUUID } from 'crypto';

interface newNote {
  cognitoId: string;
  title: string;
  content: string;
}

export interface UpdateNoteInput {
  cognitoId: string;
  id: string;
  title?: string;
  content?: string;
}

export interface DeleteNoteInput {
  cognitoId: string;
  id: string;
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
    throw new Error('Could not create note');
  }
};

export const findByUser = async (cognitoId: string) => {
  const notesRepository = new NotesRepository();

  try {
    const notes = await notesRepository.findByUser(cognitoId);

    return notes;
  } catch (error: any) {
    console.error('Find notes by user failed:', error);
    throw new Error('Could not retrieve notes');
  }
};

export const updateByUser = async (data: UpdateNoteInput) => {
  const notesRepository = new NotesRepository();

  try {
    const { cognitoId, id, title, content } = data;

    const updatedNote = await notesRepository.updateByUser(cognitoId, id, { title, content });

    return updatedNote;
  } catch (error: any) {
    console.error('Update note failed:', error);
    throw new Error('Could not update note');
  }
};

export const deleteById = async (data: DeleteNoteInput) => {
  const notesRepository = new NotesRepository();

  try {
    const { cognitoId, id } = data;
    await notesRepository.deleteById(cognitoId, id);

    return {
      message: 'Note deleted successfully',
    };
  } catch (error: any) {
    throw new Error('Could not delete note');
  }
};
