-- Fix function search path for handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Drop overly permissive INSERT policy and create more restrictive one
-- Registration is still open to public but we validate that required fields are provided
DROP POLICY IF EXISTS "Anyone can register" ON public.investor_registrations;

CREATE POLICY "Public can register with valid data"
  ON public.investor_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL 
    AND full_name IS NOT NULL 
    AND investor_type IS NOT NULL 
    AND investment_capacity IS NOT NULL
    AND nda_accepted_at IS NOT NULL
  );

-- Also make anon SELECT policy more restrictive - only allow checking own email
DROP POLICY IF EXISTS "Public can check registration by email" ON public.investor_registrations;