// 1 setup payment sheet
// 2 Open stripe checkout form
import { supabase } from '@/supabaseClient';
import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import { CollectionMode } from '@stripe/stripe-react-native/lib/typescript/src/types/PaymentSheet';
const fetchStripekeys = async (totalAmount: number) => {
  const amountInCents = Math.round(totalAmount * 100); // Convert to cents and round
  const { data, error } = await supabase.functions.invoke('stripe-checkout', {
    body: {
      totalAmount: amountInCents,
    },
  });

  if (error) throw new Error(error.message);

  return data;
};

export const setupStripePaymentSheet = async (totalAmount: number) => {
  // Fetch paymentIntent and publishable key from server
  const { paymentIntent, publicKey, ephemeralKey, customer } =
    await fetchStripekeys(totalAmount);

  if (!paymentIntent || !publicKey) {
    throw new Error('Failed to fetch Stripe keys');
  }

  await initPaymentSheet({
    merchantDisplayName: 'Chitts',
    paymentIntentClientSecret: paymentIntent,
    customerId: customer,
    customerEphemeralKeySecret: ephemeralKey,
    billingDetailsCollectionConfiguration: {
      name: 'always' as CollectionMode,
      phone: 'always' as CollectionMode,
      email:'always' as CollectionMode,
    },
    
  });
};

export const openStripeCheckout = async () => {
  const { error } = await presentPaymentSheet();

  if (error) {
    throw new Error(error.message);
  }

  return true;
};