-- ================================================================
-- Compatibility for legacy migrations on hosted Supabase
-- ================================================================

-- Hosted projects install uuid-ossp in the extensions schema. Migration 001
-- predates that convention and calls uuid_generate_v4() through public.
-- Keep this wrapper only long enough to replay the immutable migration chain;
-- the latest migration replaces every default with gen_random_uuid() and
-- removes it.
CREATE OR REPLACE FUNCTION public.uuid_generate_v4()
RETURNS UUID
LANGUAGE sql
VOLATILE
SET search_path = ''
AS $$
  SELECT extensions.uuid_generate_v4();
$$;
