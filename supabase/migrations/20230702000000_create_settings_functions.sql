
-- Function to check if a table exists
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = $1
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;

-- Function to create the settings table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_settings_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if table already exists
  IF (SELECT public.check_table_exists('settings')) THEN
    RETURN true;
  END IF;
  
  -- Create the table
  CREATE TABLE public.settings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key text NOT NULL UNIQUE,
    value text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );
  
  -- Set up RLS
  ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
  
  -- Only admins can access settings
  CREATE POLICY "Admins can manage settings" 
  ON public.settings 
  USING (is_admin(auth.uid()));
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating settings table: %', SQLERRM;
    RETURN false;
END;
$$;
