import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

Deno.serve(async (req) => {
  try {
    const { record } = await req.json();
    const { id: order_id, traveler_id, price, vat_estimate } = record;

    if (!traveler_id) {
      return new Response(JSON.stringify({ error: 'Missing traveler_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Calculate payout amount
    const payoutAmount = price + vat_estimate;

    // 2. Fetch traveler's current wallet balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', traveler_id)
      .single();

    if (profileError) throw profileError;

    // 3. Update traveler's wallet balance
    const newBalance = profile.wallet_balance + payoutAmount;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', traveler_id);

    if (updateError) throw updateError;

    // 4. Create a new wallet transaction with a detailed breakdown
    const transactionDescription = `Reward for order #${order_id}:\nItem Price: ZAR ${price.toFixed(2)}\nVAT Estimate: ZAR ${vat_estimate.toFixed(2)}\nPayout: ZAR ${payoutAmount.toFixed(2)}`;

    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert([
        {
          user_id: traveler_id,
          amount: payoutAmount,
          type: 'reward',
          description: transactionDescription,
          source: `order_${order_id}`,
        },
      ]);

    if (transactionError) throw transactionError;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});