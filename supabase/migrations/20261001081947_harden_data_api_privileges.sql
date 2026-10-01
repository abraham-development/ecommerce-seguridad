-- ================================================================
-- Harden Data API privileges and move privileged helpers private
-- ================================================================

-- Replace legacy uuid-ossp defaults before removing the replay-only wrapper
-- created by 000_uuid_ossp_compat.sql.
ALTER TABLE public.categories ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.brands ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.products ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.cart_items ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.orders ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.order_items ALTER COLUMN id SET DEFAULT gen_random_uuid();

DROP FUNCTION IF EXISTS public.uuid_generate_v4();

-- New Supabase projects can require explicit Data API grants. Keep the
-- grants aligned with the existing RLS policies instead of granting every
-- operation to every API role.
GRANT USAGE ON SCHEMA public TO anon, authenticated;

REVOKE ALL PRIVILEGES ON TABLE public.profiles FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.categories FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.brands FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.products FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.cart_items FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.orders FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.order_items FROM anon, authenticated;

GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;

GRANT SELECT ON TABLE public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.categories TO authenticated;

GRANT SELECT ON TABLE public.brands TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.brands TO authenticated;

GRANT SELECT ON TABLE public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.products TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cart_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.orders TO authenticated;
GRANT SELECT, INSERT ON TABLE public.order_items TO authenticated;

-- private is not an exposed Data API schema. Authenticated requests need
-- permission to execute this helper when RLS evaluates admin-only policies.
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

-- Migration 004 temporarily recreated this helper in the exposed public
-- schema. All current policies use private.is_admin(), so remove it.
DROP FUNCTION IF EXISTS public.is_admin();

-- Keep the signup trigger's SECURITY DEFINER function outside the exposed
-- public schema. It is invoked only by the auth.users trigger.
CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    names,
    surnames,
    mobile,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'names',
      NEW.raw_user_meta_data->>'given_name',
      NEW.raw_user_meta_data->>'names_and_surnames',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'surnames',
      NEW.raw_user_meta_data->>'family_name'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'mobile',
      NEW.raw_user_meta_data->>'phone'
    ),
    CASE
      WHEN lower(NEW.email) = 'time45120@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        names = COALESCE(public.profiles.names, EXCLUDED.names),
        surnames = COALESCE(public.profiles.surnames, EXCLUDED.surnames),
        mobile = COALESCE(public.profiles.mobile, EXCLUDED.mobile),
        role = CASE
          WHEN lower(EXCLUDED.email) = 'time45120@gmail.com' THEN 'admin'
          ELSE public.profiles.role
        END,
        updated_at = NOW();

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION private.handle_new_user() FROM authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

DROP FUNCTION IF EXISTS public.handle_new_user();
