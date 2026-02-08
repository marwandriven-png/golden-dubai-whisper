
-- Drop the overly permissive insert policy - the SECURITY DEFINER function bypasses RLS anyway
DROP POLICY "Allow system inserts to audit log" ON public.access_audit_log;
