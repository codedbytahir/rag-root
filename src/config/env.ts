import { z } from 'zod';

export const envSchema = z.object({
  // Database
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Encryption
  ENCRYPTION_KEY: z.string().min(32),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Observability (optional)
  SENTRY_DSN: z.string().url().optional(),
  LANGFUSE_PUBLIC_KEY: z.string().optional(),
  LANGFUSE_SECRET_KEY: z.string().optional(),
  LANGFUSE_HOST: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables at import time.
 * Returns a typed object with all validated values.
 * In test environment, missing optional vars won't throw.
 */
export function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Invalid environment variables. Check your .env file.');
    }
  }
  return parsed.success ? parsed.data : (process.env as unknown as Env);
}

/**
 * Safe env check that returns a partial result instead of throwing.
 * Use in optional feature initialization.
 */
export function getEnvSafe(): Partial<Env> {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    return {};
  }
  return parsed.data;
}
