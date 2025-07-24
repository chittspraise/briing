import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/supabaseClient';
import BouncyCheckbox from 'react-native-bouncy-checkbox';

const ConfirmOrder = () => {
  const { confirmOrder } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shopperProfile, setShopperProfile] = useState<any>(null);
  const [travelerProfile, setTravelerProfile] = useState<any>(null);
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    const fetchOrderAndProfiles = async () => {
      setLoading(true);

      const { data: orderData, error: orderError } = await supabase
        .from('product_orders')
        .select('*')
        .eq('id', confirmOrder)
        .single();

      if (orderError) {
        console.error('Error fetching order:', orderError);
        alert('Failed to load order info.');
        setLoading(false);
        return;
      }

      setOrder(orderData);

      const { data: shopperData, error: shopperError } = await supabase
        .from('profiles')
        .select('id, first_name, image_url, email')
        .eq('id', orderData.user_id)
        .single();

      if (shopperError) {
        console.error('Error fetching shopper profile:', shopperError);
      } else {
        setShopperProfile(shopperData);
      }

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        console.error('Error fetching traveler user:', authError);
        setTravelerProfile(null);
      } else {
        const travelerId = authData.user.id;
        const { data: travelerData, error: travelerError } = await supabase
          .from('profiles')
          .select('id, first_name, image_url, email')
          .eq('id', travelerId)
          .single();

        if (travelerError) {
          console.error('Error fetching traveler profile:', travelerError);
          setTravelerProfile(null);
        } else {
          setTravelerProfile(travelerData);
        }
      }

      setLoading(false);
    };

    if (confirmOrder) {
      fetchOrderAndProfiles();
    }
  }, [confirmOrder]);

  const handleConfirm = async () => {
    if (!order || !isAgreed) return;

    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      alert('Please log in to confirm the order.');
      return;
    }

    const travelerId = userData.user.id;
    const total = parseFloat(order.price) + parseFloat(order.vat_estimate);

    const { error: insertError } = await supabase.from('confirmed_orders').insert([
      {
        order_id: order.id,
        traveler_id: travelerId,
        shopper_id: order.user_id,
        reward: order.traveler_reward,
        total_price: total,
        product_name: order.item_name,
        store: order.store,
        price: order.price,
        estimated_tax: order.vat_estimate,
        destination: order.destination,
        source_country: order.source_country,
        wait_time: order.wait_time,
        shopper_name: shopperProfile?.first_name ?? null,
        shopper_avatar: shopperProfile?.image_url ?? null,
        shopper_email: shopperProfile?.email ?? null,
        traveler_name: travelerProfile?.first_name ?? null,
        traveler_avatar: travelerProfile?.image_url ?? null,
        traveler_email: travelerProfile?.email ?? null,
      },
    ]);

    if (insertError) {
      alert('Failed to confirm the order. Please check the database trigger.');
      console.error(insertError);
      return;
    }

    const { error: updateError } = await supabase
      .from('product_orders')
      .update({ status: 'accepted' })
      .eq('id', order.id);

    if (updateError) {
      alert('Order confirmed, but failed to update status.');
      console.error(updateError);
    } else {
      alert('Order confirmed successfully!');
      router.replace('/(tabs)/Home');
    }
  };

  if (loading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Loading order details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Confirm Delivery Request</Text>

        {order.image_url?.trim() !== '' && (
          <Image source={{ uri: order.image_url }} style={styles.image} />
        )}

        <Text style={styles.label}>Product:</Text>
        <Text style={styles.value}>{order.item_name}</Text>

        {order.store?.trim() !== '' && (
          <>
            <Text style={styles.label}>Store:</Text>
            <Text style={styles.value}>{order.store}</Text>
          </>
        )}

        <Text style={styles.label}>Price:</Text>
        <Text style={styles.value}>R{order.price}</Text>

        <Text style={styles.label}>Estimated Tax:</Text>
        <Text style={styles.value}>R{order.vat_estimate}</Text>

        <Text style={styles.label}>You Earn:</Text>
        <Text style={[styles.value, styles.reward]}>R{order.traveler_reward}</Text>

        <Text style={styles.label}>From:</Text>
        <Text style={styles.value}>{order.source_country}</Text>

        <Text style={styles.label}>To:</Text>
        <Text style={styles.value}>{order.destination}</Text>

        <Text style={styles.label}>Wait Time:</Text>
        <Text style={styles.value}>{order.wait_time}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <BouncyCheckbox
          size={22}
          fillColor="#00C753"
          unFillColor="transparent"
          text="I agree to purchase and deliver this item within the specified time."
          iconStyle={{ borderColor: '#fff', borderRadius: 6 }}
          innerIconStyle={{ borderWidth: 2, borderRadius: 6 }}
          textStyle={styles.declarationText}
          onPress={(isChecked: boolean) => setIsAgreed(isChecked)}
          style={{ marginBottom: 15 }}
        />
        <TouchableOpacity
          style={[styles.confirmButton, !isAgreed && styles.disabledButton]}
          onPress={handleConfirm}
          disabled={!isAgreed}
        >
          <Text style={styles.confirmText}>Confirm Delivery Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 10,
  },
  heading: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: '#111',
    resizeMode: 'contain',
  },
  label: {
    color: '#aaa',
    fontWeight: '600',
    marginTop: 12,
  },
  value: {
    color: '#fff',
    fontSize: 16,
  },
  reward: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f0',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  declarationText: {
    color: '#ccc',
    fontSize: 14,
    textDecorationLine: 'none',
  },
  confirmButton: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  confirmText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ConfirmOrder;
