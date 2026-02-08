
-- Add missing columns to investor_registrations
ALTER TABLE public.investor_registrations 
  ADD COLUMN IF NOT EXISTS company_domain TEXT,
  ADD COLUMN IF NOT EXISTS email_reputation_score INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS approval_source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS access_token_id UUID,
  ADD COLUMN IF NOT EXISTS nda_document_url TEXT,
  ADD COLUMN IF NOT EXISTS is_disposable_email BOOLEAN DEFAULT false;

-- Access tokens table
CREATE TABLE IF NOT EXISTS public.access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES public.investor_registrations(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN DEFAULT false NOT NULL,
  access_count INTEGER DEFAULT 0 NOT NULL,
  device_fingerprint TEXT,
  ip_address TEXT,
  user_agent TEXT,
  last_accessed_at TIMESTAMPTZ,
  first_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK from investor_registrations to access_tokens
ALTER TABLE public.investor_registrations 
  DROP CONSTRAINT IF EXISTS fk_access_token,
  ADD CONSTRAINT fk_access_token FOREIGN KEY (access_token_id) REFERENCES public.access_tokens(id) ON DELETE SET NULL;

-- Pre-approved contacts table
CREATE TABLE IF NOT EXISTS public.pre_approved_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  phone TEXT,
  company_name TEXT,
  source TEXT DEFAULT 'manual',
  notes TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT email_or_phone_required CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Google sheets config table
CREATE TABLE IF NOT EXISTS public.google_sheets_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_url TEXT NOT NULL,
  sheet_id TEXT NOT NULL,
  sheet_name TEXT DEFAULT 'Sheet1',
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending',
  sync_error TEXT,
  total_contacts_synced INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_approved_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_sheets_config ENABLE ROW LEVEL SECURITY;

-- Triggers
DROP TRIGGER IF EXISTS update_investor_registrations_updated_at ON public.investor_registrations;
CREATE TRIGGER update_investor_registrations_updated_at
  BEFORE UPDATE ON public.investor_registrations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Validate access token function
CREATE OR REPLACE FUNCTION public.validate_access_token(
  token_str TEXT,
  current_fingerprint TEXT DEFAULT NULL,
  current_ip TEXT DEFAULT NULL,
  current_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (is_valid BOOLEAN, investor_id UUID, error_message TEXT, device_match BOOLEAN) AS $$
DECLARE
  token_record RECORD;
BEGIN
  SELECT * INTO token_record FROM public.access_tokens WHERE token = token_str AND is_revoked = false;
  IF token_record IS NULL THEN RETURN QUERY SELECT false, NULL::UUID, 'Invalid or revoked link'::TEXT, false; RETURN; END IF;
  IF token_record.expires_at < now() THEN RETURN QUERY SELECT false, token_record.investor_id, 'Link has expired'::TEXT, false; RETURN; END IF;

  IF token_record.device_fingerprint IS NULL THEN
    UPDATE public.access_tokens SET 
      device_fingerprint = current_fingerprint, ip_address = current_ip, user_agent = current_user_agent, 
      first_accessed_at = now(), access_count = 1, last_accessed_at = now(), updated_at = now() 
    WHERE id = token_record.id;
    RETURN QUERY SELECT true, token_record.investor_id, NULL::TEXT, true;
  ELSIF token_record.device_fingerprint = current_fingerprint THEN
    UPDATE public.access_tokens SET access_count = access_count + 1, last_accessed_at = now(), updated_at = now() WHERE id = token_record.id;
    RETURN QUERY SELECT true, token_record.investor_id, NULL::TEXT, true;
  ELSE
    RETURN QUERY SELECT false, token_record.investor_id, 'Link is bound to another device'::TEXT, false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RLS Policies
CREATE POLICY "Admin full access access_tokens" ON public.access_tokens FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access pre_approved_contacts" ON public.pre_approved_contacts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access google_sheets_config" ON public.google_sheets_config FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Public token validation policy
CREATE POLICY "Anyone can validate tokens" ON public.access_tokens FOR SELECT TO anon, authenticated USING (true);
