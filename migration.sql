-- ======================================================================================
-- RAG ROOT: BRAIN SETTINGS & USAGE LOGGING MIGRATION
-- ======================================================================================

-- 1. Update Brains table
ALTER TABLE public.brains
ADD COLUMN IF NOT EXISTS chat_model TEXT DEFAULT 'llama3-8b-8192',
ADD COLUMN IF NOT EXISTS embedding_model TEXT DEFAULT 'gemini-embedding-001',
ADD COLUMN IF NOT EXISTS groq_api_key TEXT,
ADD COLUMN IF NOT EXISTS google_api_key TEXT,
ADD COLUMN IF NOT EXISTS use_global_keys BOOLEAN DEFAULT TRUE;

-- 2. Create Profiles table for global settings
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  global_groq_api_key TEXT,
  global_google_api_key TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Check if policies exist before creating them to avoid errors
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own profile') THEN
        CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END
$$;

-- 3. Create Request Logs table
CREATE TABLE IF NOT EXISTS public.request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  brain_id UUID REFERENCES public.brains(id) ON DELETE SET NULL,
  status TEXT, -- 'success' or 'error'
  tokens_used INTEGER DEFAULT 0,
  model_used TEXT,
  error_message TEXT,
  type TEXT, -- 'chat' or 'ingest'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on request_logs
ALTER TABLE public.request_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own logs') THEN
        CREATE POLICY "Users can view their own logs" ON public.request_logs FOR SELECT USING (auth.uid() = user_id);
    END IF;
END
$$;

-- 4. Indexes for scalability
CREATE INDEX IF NOT EXISTS request_logs_user_id_idx ON public.request_logs(user_id);
CREATE INDEX IF NOT EXISTS request_logs_brain_id_idx ON public.request_logs(brain_id);
CREATE INDEX IF NOT EXISTS request_logs_created_at_idx ON public.request_logs(created_at);

-- 5. FUNCTION: Check Rate Limit (10 requests per hour)
CREATE OR REPLACE FUNCTION public.check_rate_limit(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    request_count INTEGER;
BEGIN
    SELECT count(*)
    INTO request_count
    FROM public.request_logs
    WHERE user_id = target_user_id
      AND created_at > now() - interval '1 hour';

    RETURN request_count < 10;
END;
$$;
