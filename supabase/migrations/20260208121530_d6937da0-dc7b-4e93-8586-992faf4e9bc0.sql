
-- Add email verification fields to investor_registrations
ALTER TABLE public.investor_registrations 
ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token text,
ADD COLUMN IF NOT EXISTS verification_token_expires_at timestamptz;

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_investor_verification_token ON public.investor_registrations(verification_token) WHERE verification_token IS NOT NULL;
