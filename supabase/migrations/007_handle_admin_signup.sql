-- ================================================================
-- Set admin role automatically for time45120@gmail.com on sign up
-- ================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    CASE 
      WHEN lower(NEW.email) = 'time45120@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        role = CASE 
          WHEN lower(EXCLUDED.email) = 'time45120@gmail.com' THEN 'admin'
          ELSE public.profiles.role
        END,
        updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Retroactively set the admin role for any existing user with this email
UPDATE public.profiles
SET role = 'admin',
    updated_at = NOW()
WHERE lower(email) = 'time45120@gmail.com';
