import { beforeAll } from 'vitest';

// Set test environment variables
beforeAll(() => {
  process.env['NODE_ENV'] = 'test';
  process.env['NEXT_PUBLIC_SUPABASE_URL'] = 'http://localhost:54321';
  process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = 'test-anon-key';
  process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test-service-role-key';
  process.env['ENCRYPTION_KEY'] = 'test-encryption-key-must-be-32-chars!!';
  process.env['NEXT_PUBLIC_APP_URL'] = 'http://localhost:3000';
});
