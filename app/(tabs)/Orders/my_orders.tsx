// MyOrdersPage.tsx (Stripe checkout integrated using stripe.ts helpers)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/supabaseClient';
import { openStripeCheckout, setupStripePaymentSheet } from '@/app/lib/stripe';
 // assuming this is the correct path

// Order type remains the same
// ...
type Order = {
  id: number;
  user_id: string;
  item_name: string;
  store: string;
  price: number;
  vat_estimate: number;
  traveler_reward: number;
  image_url?: string;
  created_at: string;
  status: string;
  destination: string;
  source_country: string;
  wait_time: string;
  confirmed_id?: number;
  shopper_id?: string;
  traveler_id?: string;
  first_name: string;
  avatar?: string;
  rating: number;
  images: string[];
  time: string;
};

const STATUS_CHAIN = ['pending', 'accepted', 'paid', 'purchased', 'intransit', 'delivered', 'received'];
const renderStars = (rating: number) => '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [dropdownsVisible, setDropdownsVisible] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return;
      const userId = data.user.id;
      setCurrentUserId(userId);
      fetchOrders(userId);
    };
    fetchUserAndOrders();
  }, []);

  const fetchOrders = async (userId: string) => {
    setLoading(true);
    const { data: productOrders } = await supabase.from('product_orders').select('*').order('created_at', { ascending: false });
    const { data: confirmedOrders } = await supabase.from('confirmed_orders').select('*');
    const { data: profiles } = await supabase.from('profiles').select('id, first_name, image_url');
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    const filteredOrders = (productOrders || []).filter(order => {
      const confirmed = confirmedOrders?.find(co => co.order_id === order.id);
      return [order.user_id, confirmed?.shopper_id, confirmed?.traveler_id].includes(userId);
    });

    const enriched: Order[] = filteredOrders.map(order => {
      const profile = profileMap.get(order.user_id);
      const confirmed = confirmedOrders?.find(co => co.order_id === order.id);
      return {
        ...order,
        confirmed_id: confirmed?.id,
        shopper_id: confirmed?.shopper_id,
        traveler_id: confirmed?.traveler_id,
        first_name: profile?.first_name || 'Unknown',
        avatar: profile?.image_url,
        rating: 4,
        images: order.image_url ? [order.image_url] : [],
        time: new Date(order.created_at).toLocaleString(),
      };
    });
    setOrders(enriched);
    setLoading(false);
  };

  const toggleDropdown = (id: number) => {
    setDropdownsVisible(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateStatus = async (order: Order, newStatus: string) => {
    const results = await Promise.all([
      supabase.from('product_orders').update({ status: newStatus }).eq('id', order.id),
      order.confirmed_id
        ? supabase.from('confirmed_orders').update({ status: newStatus }).eq('id', order.confirmed_id)
        : Promise.resolve({ error: null }),
    ]);
    if (results.some(r => r.error)) Alert.alert('Error', 'Status update failed.');
    else fetchOrders(currentUserId!);
  };

  const handleCheckout = async (order: Order) => {
    const total = order.price + order.vat_estimate + order.traveler_reward;
    try {
      await setupStripePaymentSheet(total);
      await openStripeCheckout();
      await updateStatus(order, 'paid');
      Alert.alert('Success', 'Payment completed successfully.');
    } catch (err: any) {
      Alert.alert('Payment Error', err.message);
    }
  };

  const renderStatusBar = (status: string) => {
    const index = STATUS_CHAIN.indexOf(status);
    return (
      <View style={{ flexDirection: 'row', marginVertical: 8 }}>
        {STATUS_CHAIN.map((_, i) => (
          <View
            key={i}
            style={{ flex: 1, height: 6, marginHorizontal: 2, backgroundColor: status === 'cancelled' ? 'red' : i <= index ? 'green' : '#555' }}
          />
        ))}
      </View>
    );
  };

  const renderCard = (item: Order) => {
    const shopperConfirmed = item.shopper_id === currentUserId;
    const isCreator = item.user_id === currentUserId;
    const travelerConfirmed = item.traveler_id === currentUserId;
    let statusOptions: string[] = [];

    if (item.status === 'pending' && isCreator) statusOptions = ['cancelled'];
    else if (item.status === 'pending' && !isCreator) statusOptions = ['accepted'];
    else if (travelerConfirmed) statusOptions = ['purchased', 'intransit', 'delivered', 'cancelled'];
    else if (shopperConfirmed) statusOptions = ['paid', 'received', 'cancelled'];

    return (
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status: {item.status}</Text>
          {shopperConfirmed && item.status === 'accepted' && (
            <TouchableOpacity style={styles.checkoutButton} onPress={() => handleCheckout(item)}>
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          )}
          {shopperConfirmed && item.status === 'pending' && (
            <View style={[styles.checkoutButton, styles.disabledButton]}>
              <Text style={styles.checkoutText}>Checkout</Text>
            </View>
          )}
        </View>
        {renderStatusBar(item.status)}
        <View style={styles.profileRow}>
          {item.avatar && <Image source={{ uri: item.avatar }} style={styles.avatar} />}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.first_name}</Text>
            <Text style={styles.rating}>{renderStars(item.rating)}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          {statusOptions.length > 0 && (
            <TouchableOpacity onPress={() => toggleDropdown(item.id)}>
              <Ionicons name="menu" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        {dropdownsVisible[item.id] && (
          <View style={styles.dropdownMenu}>
            {statusOptions.map((s) => (
              <TouchableOpacity key={s} onPress={() => updateStatus(item, s)}>
                <Text style={styles.dropdownItem}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <Text style={styles.productName}>{item.item_name}</Text>
        {item.images.length > 0 && (
          <FlatList
            horizontal
            data={item.images}
            keyExtractor={(uri) => uri}
            renderItem={({ item: uri }) => <Image source={{ uri }} style={styles.productImage} />}
          />
        )}
        <Text style={styles.price}>R{item.traveler_reward}</Text>
        <Text style={styles.productDetail}>Price: R{item.price} + Tax: R{item.vat_estimate}</Text>
        <Text style={styles.label}>Store:</Text>
        <Text style={styles.value}>{item.store}</Text>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Deliver to:</Text>
          <Text style={styles.value}>{item.destination}</Text>
          <Text style={styles.label}>From:</Text>
          <Text style={styles.value}>{item.source_country}</Text>
          <Text style={styles.label}>Wait time:</Text>
          <Text style={styles.value}>{item.wait_time}</Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => renderCard(item)}
      refreshing={loading}
      onRefresh={() => currentUserId && fetchOrders(currentUserId)}
      contentContainerStyle={{ padding: 16 }}
    />
  );
};


const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusLabel: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
  },
  rating: {
    color: '#ccc',
  },
  time: {
    color: '#888',
    fontSize: 12,
  },
  statusRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 4,
},
checkoutButton: {
  backgroundColor: '#fff',
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 8,
},
checkoutText: {
  color: '#000',
  fontWeight: 'bold',
},
disabledButton: {
  opacity: 0.3,
},
checkoutNote: {

  color: '#ccc',
  fontSize: 12,
  marginBottom: 4,
  textAlign: 'right',
},

  dropdownMenu: {
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    marginTop: 4,
  },
  dropdownItem: {
    color: '#fff',
    paddingVertical: 6,
  },
  productName: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  productImage: {
    width: 120,
    height: 90,
    marginRight: 8,
    borderRadius: 8,
  },
  price: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 8,
  },
  productDetail: {
    color: '#ccc',
  },
  infoBox: {
    marginTop: 12,
  },
  label: {
    color: '#aaa',
    fontSize: 12,
  },
  value: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 6,
  },
});

export default MyOrdersPage;
