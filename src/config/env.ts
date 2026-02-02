import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().optional(),
  NOTES_TABLE_NAME: z.string(),
  IS_OFFLINE: z.enum(['true', 'false']).transform((value) => value === 'true'),
  DYNAMODB_ENDPOINT: z.string().optional(),
  AWS_REGION: z.string(),
  USER_POOL_ID: z.string().optional(),
  COGNITO_CLIENT_ID: z.string().optional(),
});

export const env = envSchema.parse(process.env);
