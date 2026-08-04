-- ================================================================
-- Rename profile contact fields and normalize order contact data.
-- ================================================================

ALTER TABLE public.profiles
  RENAME COLUMN full_name TO names_and_surnames;

ALTER TABLE public.profiles
  RENAME COLUMN phone TO mobile;

COMMENT ON COLUMN public.profiles.names_and_surnames IS
  'Nombres y apellidos del usuario';

COMMENT ON COLUMN public.profiles.mobile IS
  'Numero de celular del usuario';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, names_and_surnames, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'names_and_surnames',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    CASE
      WHEN lower(NEW.email) = 'time45120@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        names_and_surnames = COALESCE(
          public.profiles.names_and_surnames,
          EXCLUDED.names_and_surnames
        ),
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
      (shipping_address - 'full_name' - 'phone')
      || jsonb_strip_nulls(
        jsonb_build_object(
          'names_and_surnames', COALESCE(
            shipping_address->'names_and_surnames',
            shipping_address->'full_name'
          ),
          'mobile', COALESCE(
            shipping_address->'mobile',
            shipping_address->'phone'
          )
        )
      ),
    updated_at = NOW()
WHERE shipping_address ? 'full_name'
   OR shipping_address ? 'phone';
