-- Enable the UUID extension if it's not already enabled.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- Step 1: Add a new UUID column to your table
ALTER TABLE public.product_orders
ADD COLUMN new_id UUID DEFAULT uuid_generate_v4();

-- Step 2: Backfill the new_id column for existing rows
-- This is important if you have existing data.
UPDATE public.product_orders SET new_id = uuid_generate_v4() WHERE new_id IS NULL;

-- Step 3: Drop the old primary key constraint
-- Note: You might need to find the actual constraint name from your table schema.
-- You can find it in the Supabase dashboard under Database -> Tables -> product_orders -> Constraints.
-- Let's assume the constraint is named 'product_orders_pkey'.
ALTER TABLE public.product_orders
DROP CONSTRAINT product_orders_pkey;

-- Step 4: Drop the old 'id' column
ALTER TABLE public.product_orders
DROP COLUMN id;

-- Step 5: Rename the new column to 'id'
ALTER TABLE public.product_orders
RENAME COLUMN new_id TO id;

-- Step 6: Set the new 'id' column as the primary key
ALTER TABLE public.product_orders
ADD PRIMARY KEY (id);

-- Step 7: Ensure the default value is set for future inserts
ALTER TABLE public.product_orders
ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Note: After running this, you will need to update your application code
-- to expect a UUID for the 'id' field in 'product_orders' instead of a number.
