import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number(),
  NOTES_TABLE_NAME: z.string(),
  IS_OFFLINE: z.enum(['true', 'false']).transform((value) => value === 'true'),
  DYNAMODB_ENDPOINT: z.string().url(),
  AWS_REGION: z.string(),
});

export const env = envSchema.parse(process.env);
