-- Add initial admin to psychologists table
-- This will allow site4people@gmail.com to access the admin panel

-- First, ensure the user exists in auth.users and users table
-- This will be created automatically on first login via SSO

-- Add admin to psychologists table if not exists
INSERT INTO psychologists (user_id, email, full_name, role, active)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'site4people@gmail.com' LIMIT 1),
  'site4people@gmail.com',
  'Admin',
  'admin',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM psychologists WHERE email = 'site4people@gmail.com'
);

-- Alternative approach: use trigger to auto-add admin on first login
CREATE OR REPLACE FUNCTION public.handle_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the admin email
  IF NEW.email = 'site4people@gmail.com' THEN
    -- Add to psychologists table as admin if not exists
    INSERT INTO public.psychologists (user_id, email, full_name, role, active)
    VALUES (NEW.id::text, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin'), 'admin', true)
    ON CONFLICT (email) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_user();

-- Also update existing admin if already exists
UPDATE psychologists 
SET role = 'admin', active = true 
WHERE email = 'site4people@gmail.com';

