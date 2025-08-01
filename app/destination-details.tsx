import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '@/supabaseClient';
import { SafeAreaView } from 'react-native-safe-area-context';

const DestinationDetailsPage = () => {
  const { destination, type } = useLocalSearchParams<{
    destination: string;
    type: 'destinations' | 'offers';
  }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (destination) {
      fetchItems();
    }
  }, [destination, type]);

  const fetchItems = async () => {
    setLoading(true);
    let query = supabase
      .from('product_orders')
      .select(
        `
        id,
        item_name,
        price,
        store,
        image_url,
        destination
      `
      )
      .eq('destination', destination);

    if (type === 'offers') {
      const { data: confirmedOrderIds, error: confirmedError } =
        await supabase.from('confirmed_orders').select('order_id');

      if (confirmedError) {
        console.error('Error fetching confirmed offers:', confirmedError);
        setLoading(false);
        return;
      }
      const orderIds = confirmedOrderIds.map((o) => o.order_id);
      query = query.in('id', orderIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching ${type}:`, error);
    } else {
      setItems(data);
    }
    setLoading(false);
  };

  const handleItemPress = (item: any) => {
    router.push({
      pathname: '/ProductPage',
      params: { orderId: item.id },
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleItemPress(item)}
    >
      <Image
        source={{
          uri:
            item.image_url ||
            `https://picsum.photos/seed/${item.id}/200/200`,
        }}
        style={styles.productImage}
      />
      <View style={styles.orderInfo}>
        <Text style={styles.productName}>{item.item_name}</Text>
        <Text style={styles.productPrice}>R{item.price}</Text>
        <Text style={styles.store}>Store: {item.store}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        {type === 'offers' ? 'Confirmed Offers' : 'Orders'} for {destination}
      </Text>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No {type === 'offers' ? 'offers' : 'orders'} found for this
            destination.
          </Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
    resizeMode: 'contain',
  },
  orderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  productPrice: {
    fontSize: 14,
    color: '#4caf50',
    marginTop: 4,
  },
  store: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default DestinationDetailsPage;
