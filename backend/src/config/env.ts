import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from backend folder or workspace root
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((v) => parseInt(v, 10)),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required for the AI reasoning layer'),
  DATABASE_PATH: z.string().default('./data/refunds.db'),
});

const parsed = envSchema.safeParse(process.cwd());

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  DATABASE_PATH: process.env.DATABASE_PATH || './data/refunds.db',
};
