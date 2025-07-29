-- Create the payout_options table
CREATE TABLE IF NOT EXISTS public.payout_options (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  payout_option TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS) for the payout_options table
ALTER TABLE public.payout_options ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to insert their own payout option
CREATE POLICY "Allow users to insert their own payout option"
ON public.payout_options
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to view their own payout option
CREATE POLICY "Allow users to view their own payout option"
ON public.payout_options
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow users to update their own payout option
CREATE POLICY "Allow users to update their own payout option"
ON public.payout_options
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
