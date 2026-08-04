-- ================================================================
-- Split names and surnames into independent profile and order fields
-- ================================================================

ALTER TABLE public.profiles
  RENAME COLUMN names_and_surnames TO names;

ALTER TABLE public.profiles
  ADD COLUMN surnames TEXT;

COMMENT ON COLUMN public.profiles.names IS
  'Nombres del usuario';

COMMENT ON COLUMN public.profiles.surnames IS
  'Apellidos del usuario';

CREATE OR REPLACE FUNCTION public.handle_new_user()
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

UPDATE public.orders
SET shipping_address =
      (shipping_address - 'names_and_surnames')
      || jsonb_strip_nulls(
        jsonb_build_object(
          'names', COALESCE(
            shipping_address->'names',
            shipping_address->'names_and_surnames'
          ),
          'surnames', shipping_address->'surnames'
        )
      ),
    updated_at = NOW()
WHERE shipping_address ? 'names_and_surnames';
