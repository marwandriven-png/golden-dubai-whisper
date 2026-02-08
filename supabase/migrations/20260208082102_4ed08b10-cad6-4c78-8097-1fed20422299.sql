
-- Create access audit log table
CREATE TABLE public.access_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_id UUID REFERENCES public.access_tokens(id),
  investor_id UUID REFERENCES public.investor_registrations(id),
  event_type TEXT NOT NULL, -- 'access_granted', 'device_mismatch', 'token_expired', 'token_revoked', 'token_invalid', 'new_device_blocked', 'link_forwarded', 'access_extended', 'access_revoked'
  device_fingerprint TEXT,
  ip_address TEXT,
  user_agent TEXT,
  original_email TEXT,
  attempted_email TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.access_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admin full access access_audit_log"
  ON public.access_audit_log
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow inserts from service role (edge functions) - service role bypasses RLS anyway
-- Allow the validate function to insert logs
CREATE POLICY "Allow system inserts to audit log"
  ON public.access_audit_log
  FOR INSERT
  WITH CHECK (true);

-- Index for quick lookups
CREATE INDEX idx_audit_log_token ON public.access_audit_log(token_id);
CREATE INDEX idx_audit_log_event ON public.access_audit_log(event_type);
CREATE INDEX idx_audit_log_created ON public.access_audit_log(created_at DESC);

-- Update validate_access_token to log all events and return more info
CREATE OR REPLACE FUNCTION public.validate_access_token(
  token_str text, 
  current_fingerprint text DEFAULT NULL::text, 
  current_ip text DEFAULT NULL::text, 
  current_user_agent text DEFAULT NULL::text
)
RETURNS TABLE(is_valid boolean, investor_id uuid, error_message text, device_match boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  token_record RECORD;
  investor_record RECORD;
BEGIN
  -- Find token
  SELECT * INTO token_record FROM public.access_tokens WHERE token = token_str;
  
  IF token_record IS NULL THEN 
    -- Log invalid token attempt
    INSERT INTO public.access_audit_log (event_type, device_fingerprint, ip_address, user_agent, details)
    VALUES ('token_invalid', current_fingerprint, current_ip, current_user_agent, 
            jsonb_build_object('reason', 'Token not found'));
    RETURN QUERY SELECT false, NULL::UUID, 'Invalid or revoked link'::TEXT, false; 
    RETURN; 
  END IF;
  
  -- Get investor email for audit
  SELECT email INTO investor_record FROM public.investor_registrations WHERE id = token_record.investor_id;
  
  IF token_record.is_revoked THEN
    INSERT INTO public.access_audit_log (token_id, investor_id, event_type, device_fingerprint, ip_address, user_agent, original_email, details)
    VALUES (token_record.id, token_record.investor_id, 'token_revoked', current_fingerprint, current_ip, current_user_agent, investor_record.email,
            jsonb_build_object('reason', 'Token has been revoked'));
    RETURN QUERY SELECT false, token_record.investor_id, 'This access link has been revoked.'::TEXT, false; 
    RETURN; 
  END IF;
  
  IF token_record.expires_at < now() THEN 
    INSERT INTO public.access_audit_log (token_id, investor_id, event_type, device_fingerprint, ip_address, user_agent, original_email, details)
    VALUES (token_record.id, token_record.investor_id, 'token_expired', current_fingerprint, current_ip, current_user_agent, investor_record.email,
            jsonb_build_object('expired_at', token_record.expires_at));
    RETURN QUERY SELECT false, token_record.investor_id, 'This access link has expired. Please request new approval.'::TEXT, false; 
    RETURN; 
  END IF;

  -- First access - bind device
  IF token_record.device_fingerprint IS NULL THEN
    UPDATE public.access_tokens SET 
      device_fingerprint = current_fingerprint, 
      ip_address = current_ip, 
      user_agent = current_user_agent, 
      first_accessed_at = now(), 
      access_count = 1, 
      last_accessed_at = now(), 
      updated_at = now() 
    WHERE id = token_record.id;
    
    INSERT INTO public.access_audit_log (token_id, investor_id, event_type, device_fingerprint, ip_address, user_agent, original_email, details)
    VALUES (token_record.id, token_record.investor_id, 'access_granted', current_fingerprint, current_ip, current_user_agent, investor_record.email,
            jsonb_build_object('first_access', true, 'device_bound', true));
    
    RETURN QUERY SELECT true, token_record.investor_id, NULL::TEXT, true;
  
  -- Same device - allow
  ELSIF token_record.device_fingerprint = current_fingerprint THEN
    UPDATE public.access_tokens SET 
      access_count = access_count + 1, 
      last_accessed_at = now(), 
      updated_at = now() 
    WHERE id = token_record.id;
    
    INSERT INTO public.access_audit_log (token_id, investor_id, event_type, device_fingerprint, ip_address, user_agent, original_email, details)
    VALUES (token_record.id, token_record.investor_id, 'access_granted', current_fingerprint, current_ip, current_user_agent, investor_record.email,
            jsonb_build_object('access_count', token_record.access_count + 1));
    
    RETURN QUERY SELECT true, token_record.investor_id, NULL::TEXT, true;
  
  -- Different device - BLOCK (forwarded link detection)
  ELSE
    INSERT INTO public.access_audit_log (token_id, investor_id, event_type, device_fingerprint, ip_address, user_agent, original_email, details)
    VALUES (token_record.id, token_record.investor_id, 'link_forwarded', current_fingerprint, current_ip, current_user_agent, investor_record.email,
            jsonb_build_object(
              'original_fingerprint', token_record.device_fingerprint,
              'attempted_fingerprint', current_fingerprint,
              'original_ip', token_record.ip_address,
              'attempted_ip', current_ip,
              'original_user_agent', token_record.user_agent,
              'attempted_user_agent', current_user_agent
            ));
    
    RETURN QUERY SELECT false, token_record.investor_id, 'DEVICE_MISMATCH'::TEXT, false;
  END IF;
END;
$function$;
