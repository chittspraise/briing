import { getOrCreateStripeCustomerForSupabaseUser } from "../_shared/supabase.ts";

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from 'npm:stripe@^18.3.0';

export const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req: Request) => {
  try {
    const { totalAmount } = await req.json();

  const customer = await getOrCreateStripeCustomerForSupabaseUser(req);


    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer},
      { apiVersion: '2022-11-15' }
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'zar',
      customer,
    });

    const response = {
      paymentIntent: paymentIntent.client_secret,
      publicKey: Deno.env.get('STRIPE_PUBLISHABLE_KEY'),
      ephemeralKey: ephemeralKey.secret,
      customer,
    };

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Stripe Checkout Error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
