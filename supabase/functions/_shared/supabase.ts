import { createClient } from 'jsr:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@^18.3.0';

export const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  httpClient: Stripe.createFetchHttpClient(),
});

export const getOrCreateStripeCustomerForSupabaseUser = async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Authorization header is missing');
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError) throw new Error(`Error getting user: ${userError.message}`);
  if (!user) throw new Error('User not found');

  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles') // ✅ changed from 'users' to 'profiles'
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    throw new Error(`Error fetching profile: ${profileError.message}`);
  }

  if (profile.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    metadata: {
      supabase_user_id: user.id,
    },
  });

  const { error: updateError } = await supabaseClient
    .from('profiles') // ✅ changed from 'users' to 'profiles'
    .update({ stripe_customer_id: customer.id })
    .eq('id', user.id);

  if (updateError) {
    throw new Error(`Error updating profile: ${updateError.message}`);
  }

  return customer.id;
};
