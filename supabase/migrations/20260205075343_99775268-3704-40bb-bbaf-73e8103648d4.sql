-- Create investor type enum
CREATE TYPE public.investor_type AS ENUM (
  'family_office',
  'institutional', 
  'private_investor',
  'operator',
  'other'
);

-- Create investment capacity enum
CREATE TYPE public.investment_capacity AS ENUM (
  'under_5m',
  '5m_to_10m',
  '10m_to_25m',
  '25m_to_50m',
  'over_50m'
);

-- Create approval status enum
CREATE TYPE public.approval_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

-- Create app_role enum for admin
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Investor registrations table
CREATE TABLE public.investor_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  company_name TEXT,
  phone_number TEXT,
  investor_type investor_type NOT NULL,
  investment_capacity investment_capacity NOT NULL,
  referral_source TEXT,
  nda_accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approval_status approval_status NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table for admin access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.investor_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if investor is approved by email
CREATE OR REPLACE FUNCTION public.is_approved_investor(_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.investor_registrations
    WHERE email = _email
      AND approval_status = 'approved'
  )
$$;

-- RLS Policies for investor_registrations

-- Anyone can register (insert)
CREATE POLICY "Anyone can register"
  ON public.investor_registrations
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all registrations
CREATE POLICY "Admins can view all registrations"
  ON public.investor_registrations
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Investors can view their own registration by email
CREATE POLICY "Investors can view own registration"
  ON public.investor_registrations
  FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Public can check registration status by email
CREATE POLICY "Public can check registration by email"
  ON public.investor_registrations
  FOR SELECT
  TO anon
  USING (true);

-- Admins can update registrations (approve/reject)
CREATE POLICY "Admins can update registrations"
  ON public.investor_registrations
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to update last login
CREATE OR REPLACE FUNCTION public.update_investor_last_login(_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.investor_registrations
  SET last_login_at = now(), updated_at = now()
  WHERE email = _email;
END;
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_investor_registrations_updated_at
  BEFORE UPDATE ON public.investor_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();