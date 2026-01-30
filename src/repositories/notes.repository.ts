import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient } from '../database/dynamodb.client.js';
import { env } from '../config/env.js';

export interface Note {
  id: string;
  cognitoId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export class NotesRepository {
  private docClient: DynamoDBDocumentClient;

  constructor() {
    this.docClient = DynamoDBDocumentClient.from(dynamoDbClient);
  }
  async create(note: Note): Promise<Note> {
    try {
      await this.docClient.send(
        new PutCommand({
          TableName: env.NOTES_TABLE_NAME,
          Item: note,
        }),
      );
      return note;
    } catch (error) {
      throw new Error(`Failed to create note: ${error}`);
    }
  }

  async findByUser(cognitoId: string): Promise<Note[]> {
    try {
      const result = await this.docClient.send(
        new QueryCommand({
          TableName: env.NOTES_TABLE_NAME,
          KeyConditionExpression: 'cognitoId = :cognitoId',
          ExpressionAttributeValues: {
            ':cognitoId': cognitoId,
          },
        }),
      );

      return result.Items as Note[];
    } catch (error) {
      throw new Error(`Failed to find notes for user: ${error}`);
    }
  }

  async updateByUser(
    cognitoId: string,
    id: string,
    updates: Pick<Note, 'title' | 'content'>,
  ): Promise<Note> {
    try {
      const result = await this.docClient.send(
        new UpdateCommand({
          TableName: env.NOTES_TABLE_NAME,
          Key: {
            cognitoId,
            id,
          },
          UpdateExpression: `
            SET title = :title,
                content = :content,
                updatedAt = :updatedAt
          `,
          ExpressionAttributeValues: {
            ':title': updates.title,
            ':content': updates.content,
            ':updatedAt': new Date().toISOString(),
          },
          ReturnValues: 'ALL_NEW',
        }),
      );

      return result.Attributes as Note;
    } catch (error) {
      throw new Error(`Failed to update note: ${error}`);
    }
  }

  async deleteById(cognitoId: string, id: string): Promise<void> {
    try {
      await this.docClient.send(
        new DeleteCommand({
          TableName: env.NOTES_TABLE_NAME,
          Key: {
            cognitoId,
            id,
          },
        }),
      );
    } catch (error) {
      throw new Error(`Failed to delete note by id: ${error}`);
    }
  }

  async deleteByUser(cognitoId: string, id: string): Promise<void> {
    try {
      await this.docClient.send(
        new DeleteCommand({
          TableName: env.NOTES_TABLE_NAME,
          Key: {
            cognitoId,
            id,
          },
        }),
      );
    } catch (error) {
      throw new Error(`Failed to delete note: ${error}`);
    }
  }
}
