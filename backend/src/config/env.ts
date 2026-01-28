import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Environment schema
const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  STORAGE_BASE_PATH: z.string().default('../storage'),
  DATABASE_PATH: z.string().default('../database/opmaker.db'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

// Parse and validate environment
const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());

    // In development, allow missing API key with a warning
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Running in development mode with placeholder API key');
      return {
        PORT: process.env.PORT || '3001',
        NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
        STORAGE_BASE_PATH: process.env.STORAGE_BASE_PATH || '../storage',
        DATABASE_PATH: process.env.DATABASE_PATH || '../database/opmaker.db',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'placeholder_api_key',
        CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
      };
    }

    throw new Error('Invalid environment variables');
  }

  return result.data;
};

export const env = parseEnv();

// Derived config values
export const config = {
  port: parseInt(env.PORT, 10),
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
  storage: {
    basePath: path.resolve(__dirname, '../..', env.STORAGE_BASE_PATH),
    templates: path.resolve(__dirname, '../..', env.STORAGE_BASE_PATH, 'templates'),
    generatedOps: path.resolve(__dirname, '../..', env.STORAGE_BASE_PATH, 'generated-ops'),
    excelFiles: path.resolve(__dirname, '../..', env.STORAGE_BASE_PATH, 'excel-files'),
    images: path.resolve(__dirname, '../..', env.STORAGE_BASE_PATH, 'images'),
  },
  database: {
    path: path.resolve(__dirname, '../..', env.DATABASE_PATH),
  },
  gemini: {
    apiKey: env.GEMINI_API_KEY,
  },
  cors: {
    origin: env.CORS_ORIGIN,
  },
} as const;
