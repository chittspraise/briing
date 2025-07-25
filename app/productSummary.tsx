import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/supabaseClient';
import { useTravelerOrderStore } from './store/travelerOrderStore';

export default function SummaryPage() {
  const navigation = useNavigation<any>();

  const {
    item_name,
    store,
    price,
    quantity,
    details,
    with_box,
    image_url,
    deliver_from,
    destination,
    wait_time,
    travelerId,
    clearOrder,
  } = useTravelerOrderStore();

  const [travelerReward, setTravelerReward] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user ID from Supabase on mount
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    getUser();
  }, []);

  // Calculate fees and totals
  const numericPrice = parseFloat(price || '0') || 0;
  const platformFee = Math.round(numericPrice * 0.15 * 100) / 100;
  const processingFee = Math.round(numericPrice * 0.15 * 100) / 100;
  const vatEstimate = Math.round(numericPrice * 0.15 * 100) / 100;
  const reward = parseFloat(travelerReward || '0') || 0;
  const estimatedTotal = numericPrice + platformFee + processingFee + vatEstimate + reward;

  // Submit order to Supabase
  const handleRequestDelivery = async () => {
    if (!userId) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'User not found. Please login again.' });
      return;
    }

    const payload = {
      item_name,
      store: store || null,
      price: numericPrice,
      quantity: parseInt(quantity || '1', 10),
      details,
      with_box,
      image_url,
      source_country: deliver_from,
      destination,
      wait_time,
      platform_fee: platformFee,
      processing_fee: processingFee,
      vat_estimate: vatEstimate,
      traveler_reward: reward,
      estimated_total: estimatedTotal,
      user_id: userId,
      traveler_id: travelerId || null, // explicitly null if undefined
      status: 'pending',
    };

    try {
      const { error } = await supabase.from('product_orders').insert(payload);
      if (error) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Could not create order' });
        console.error('Supabase insert error:', error);
      } else {
        clearOrder();
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Your delivery request has been submitted successfully.',
        });
        navigation.navigate('(tabs)', { screen: 'home' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'An unexpected error occurred.' });
      console.error('Unexpected error:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f0f0" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Summary</Text>
        <TouchableOpacity>
          <Ionicons name="headset-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollViewContent}>
        {/* Product Card */}
        <View style={styles.productCard}>
          {image_url ? (
            <Image source={{ uri: image_url }} style={styles.productImage} />
          ) : (
            <View style={styles.productLogoContainer}>
              <MaterialCommunityIcons name="cube-outline" size={30} color="white" />
            </View>
          )}
          <Text style={styles.productTitle}>{item_name || 'N/A'}</Text>
        </View>

        {/* Delivery Info */}
        <View style={styles.section}>
          <Text style={styles.label}>Delivery route</Text>
          <View style={styles.detailRow}>
            <Text style={styles.subLabel}>Deliver from</Text>
            <Text style={styles.value}>{deliver_from || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.subLabel}>Deliver to</Text>
            <Text style={styles.value}>{destination || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.subLabel}>Wait time</Text>
            <Text style={styles.value}>{wait_time || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.subLabel}>Delivery type</Text>
            <Text style={styles.value}>
              {travelerId ? 'Private (specific traveler)' : 'Open to any traveler'}
            </Text>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.label}>Order details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.subLabel}>Quantity</Text>
            <Text style={styles.value}>{quantity || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.subLabel}>Packaging</Text>
            <Text style={styles.value}>{with_box ? 'With box' : 'Without box'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.subLabel}>Store</Text>
            <Text style={styles.value}>{store || 'N/A'}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Product details</Text>
          <Text style={styles.value}>{details || 'No details provided'}</Text>
        </View>

        {/* Reward */}
        <View style={styles.section}>
          <Text style={styles.label}>Traveler reward (you decide)</Text>
          <View style={styles.rewardInputContainer}>
            <Text style={styles.zarText}>ZAR</Text>
            <TextInput
              style={styles.rewardInput}
              placeholder="e.g. 100"
              keyboardType="numeric"
              value={travelerReward}
              onChangeText={setTravelerReward}
            />
          </View>
        </View>

        {/* Cost Breakdown */}
        <View style={styles.section}>
          <Text style={styles.label}>Cost breakdown</Text>
          {[
            { label: 'Product price', value: `ZAR${numericPrice.toFixed(2)}` },
            { label: 'VAT (estimated)', value: `ZAR${vatEstimate.toFixed(2)}` },
            { label: 'Platform fee', value: `ZAR${platformFee.toFixed(2)}` },
            { label: 'Processing fee', value: `ZAR${processingFee.toFixed(2)}` },
            { label: 'Traveler reward', value: `ZAR${reward.toFixed(2)}` },
            { label: 'Estimated total', value: `ZAR${estimatedTotal.toFixed(2)}` },
          ].map((item, index) => (
            <View key={index} style={styles.detailRow}>
              <Text style={styles.subLabel}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.requestButton} onPress={handleRequestDelivery}>
          <View style={styles.buttonTextContainer}>
            <MaterialCommunityIcons name="dots-horizontal" size={24} color="white" />
            <Text style={styles.requestButtonText}>Request delivery offers</Text>
            <Ionicons name="chevron-forward-outline" size={24} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F0F0' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'black' },
  scrollViewContent: { flex: 1, paddingHorizontal: 15, paddingVertical: 10 },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingLeft: 15,
  },
  productLogoContainer: {
    width: 60,
    height: 60,
    backgroundColor: 'black',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  productTitle: { fontSize: 20, fontWeight: 'bold', color: 'black', flex: 1 },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  label: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 10 },
  subLabel: { fontSize: 14, color: '#333', flex: 1 },
  value: { fontSize: 14, fontWeight: '500', color: '#000', textAlign: 'right' },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 10,
    color: '#000',
  },
  rewardInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  zarText: {
    fontWeight: 'bold',
    marginRight: 5,
    color: 'black',
    fontSize: 14,
  },
  rewardInput: {
    flex: 1,
    paddingVertical: 10,
    color: '#000',
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  requestButton: {
    backgroundColor: '#000',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 25,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
  },
  requestButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
});
