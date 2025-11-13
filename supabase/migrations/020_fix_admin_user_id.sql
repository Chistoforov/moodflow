-- Fix admin user_id in psychologists table
-- The user_id should reference users.sso_uid (TEXT), not auth.users.id (UUID)

-- First, update existing admin record if it exists with wrong user_id
UPDATE psychologists 
SET user_id = (
  SELECT sso_uid FROM users WHERE email = 'site4people@gmail.com' LIMIT 1
)
WHERE email = 'site4people@gmail.com'
AND user_id IS NOT NULL;

-- Fix the trigger function to use sso_uid instead of auth.users.id
CREATE OR REPLACE FUNCTION public.handle_admin_user()
RETURNS TRIGGER AS $$
DECLARE
  v_sso_uid TEXT;
BEGIN
  -- Check if this is the admin email
  IF NEW.email = 'site4people@gmail.com' THEN
    -- Get the sso_uid from users table (which should be created by auto_create_user trigger)
    SELECT sso_uid INTO v_sso_uid
    FROM public.users
    WHERE email = NEW.email
    LIMIT 1;
    
    IF v_sso_uid IS NOT NULL THEN
      -- Add to psychologists table as admin if not exists
      INSERT INTO public.psychologists (user_id, email, full_name, role, active)
      VALUES (v_sso_uid, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin'), 'admin', true)
      ON CONFLICT (email) DO UPDATE
      SET user_id = v_sso_uid, role = 'admin', active = true;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_user();

-- Also insert/update admin record directly if user already exists
INSERT INTO psychologists (user_id, email, full_name, role, active)
SELECT 
  u.sso_uid,
  'site4people@gmail.com',
  'Admin',
  'admin',
  true
FROM users u
WHERE u.email = 'site4people@gmail.com'
ON CONFLICT (email) DO UPDATE
SET user_id = EXCLUDED.user_id, role = 'admin', active = true;

