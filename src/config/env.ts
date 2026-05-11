import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  SN_BASE_URL: z.string().url(),
  SN_USERNAME: z.string().min(1),
  SN_PASSWORD: z.string().min(1),
  SN_TABLE: z.string().default('incident'),
  SN_DEFAULT_LIMIT: z.coerce.number().default(20),

  MOVIDESK_BASE_URL: z.string().url(),
  MOVIDESK_TOKEN: z.string().min(1),

  MOVIDESK_DEFAULT_OWNER_TEAM: z.string().optional(),
  MOVIDESK_DEFAULT_SERVICE: z.string().optional(),
  MOVIDESK_DEFAULT_CATEGORY: z.string().optional(),
  MOVIDESK_DEFAULT_URGENCY: z.string().default('Medium'),

  MOVIDESK_FALLBACK_EMAIL: z.string().email(),
  MOVIDESK_CREATED_BY_ID: z.string().min(1),
});

export const env = envSchema.parse(process.env);