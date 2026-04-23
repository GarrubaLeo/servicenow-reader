import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  SN_BASE_URL: z.string().url(),
  SN_USERNAME: z.string().min(1),
  SN_PASSWORD: z.string().min(1),
  SN_TABLE: z.string().default('incident'),
  SN_DEFAULT_LIMIT: z.coerce.number().default(20)
});

export const env = envSchema.parse(process.env);