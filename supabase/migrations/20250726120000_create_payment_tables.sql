-- Create the bank_details table
CREATE TABLE IF NOT EXISTS public.bank_details (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  account_holder_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  branch_code TEXT NOT NULL,
  payout_option TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS) for the bank_details table
ALTER TABLE public.bank_details ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to insert their own bank details
CREATE POLICY "Allow users to insert their own bank details"
ON public.bank_details
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to view their own bank details
CREATE POLICY "Allow users to view their own bank details"
ON public.bank_details
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow users to update their own bank details
CREATE POLICY "Allow users to update their own bank details"
ON public.bank_details
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create the payment_methods table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.payment_methods (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  payout_option TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS) for the payment_methods table
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to insert their own payment method
CREATE POLICY "Allow users to insert their own payment method"
ON public.payment_methods
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to view their own payment method
CREATE POLICY "Allow users to view their own payment method"
ON public.payment_methods
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow users to update their own payment method
CREATE POLICY "Allow users to update their own payment method"
ON public.payment_methods
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
