import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/supabaseClient';

const STATUS_CHAIN = ['pending', 'accepted', 'paid', 'purchased', 'intransit', 'delivery', 'received'];

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
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

    const { data: productOrders, error } = await supabase
      .from('product_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Product order fetch error:', error);
      return;
    }

    const { data: confirmedOrders } = await supabase.from('confirmed_orders').select('*');
    const { data: profiles } = await supabase.from('profiles').select('id, first_name, image_url');

    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    const filteredOrders = (productOrders || []).filter(order => {
      const confirmed = confirmedOrders?.find(co => co.order_id === order.id);
      const isShopper = confirmed?.shopper_id === userId;
      const isTraveler = confirmed?.traveler_id === userId;
      const isCreator = order.user_id === userId;

      if (order.status === 'pending') {
        return isCreator; // only creator sees pending
      }

      return isShopper || isTraveler; // both parties see active orders
    });

    const enriched = filteredOrders.map(order => {
      const profile = profileMap.get(order.user_id);
      return {
        ...order,
        first_name: profile?.first_name || 'Unknown',
        avatar: profile?.image_url || '',
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

  const updateStatus = async (order: any, newStatus: string) => {
    const { error } = await supabase
      .from('product_orders')
      .update({ status: newStatus })
      .eq('id', order.id);

    if (error) {
      Alert.alert('Error', 'Status update failed');
    } else if (currentUserId) {
      fetchOrders(currentUserId);
    }
  };

  const renderStatusBar = (status: string) => {
    if (status === 'cancelled') {
      return (
        <View style={styles.statusRow}>
          <View style={[styles.statusBar, { backgroundColor: 'red' }]} />
          {STATUS_CHAIN.slice(1).map((_, i) => (
            <View key={i} style={[styles.statusBar, { backgroundColor: '#555' }]} />
          ))}
        </View>
      );
    }

    const index = STATUS_CHAIN.indexOf(status);
    return (
      <View style={styles.statusRow}>
        {STATUS_CHAIN.map((s, i) => (
          <View key={s} style={[styles.statusBar, { backgroundColor: i <= index ? 'green' : '#555' }]} />
        ))}
      </View>
    );
  };

  const renderCard = (item: any) => {
    const isCreator = item.user_id === currentUserId;

    const travelerConfirmed = item.traveler_id === currentUserId;
    const shopperConfirmed = item.user_id === currentUserId;

    let statusOptions: string[] = [];

    if (item.status === 'pending' && isCreator) {
      statusOptions = ['cancelled'];
    } else if (item.status === 'pending' && !isCreator) {
      statusOptions = ['accepted'];
    } else if (travelerConfirmed) {
      statusOptions = ['purchased', 'intransit', 'delivery', 'cancelled'];
    } else if (shopperConfirmed) {
      statusOptions = ['paid', 'received', 'cancelled'];
    }

    const dropdownVisible = dropdownsVisible[item.id];

    return (
      <View style={styles.card}>
        <Text style={styles.statusLabel}>Status: {item.status}</Text>
        {renderStatusBar(item.status)}

        <View style={styles.profileRow}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
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
        </View>

        {dropdownVisible && (
          <View style={styles.dropdownMenu}>
            {statusOptions.map((s) => (
              <TouchableOpacity key={s} onPress={() => updateStatus(item, s)}>
                <Text style={styles.dropdownItem}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.productName}>{item.item_name}</Text>

        {Array.isArray(item.images) && item.images.length > 0 && (
          <FlatList
            horizontal
            data={item.images}
            keyExtractor={(uri) => uri}
            renderItem={({ item: uri }) => (
              <Image source={{ uri }} style={styles.productImage} />
            )}
          />
        )}

        <Text style={styles.price}>R{item.traveler_reward}</Text>
        <Text style={styles.productDetail}>Price: R{item.price} + Tax: R{item.vat_estimate}</Text>

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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusBar: {
    height: 6,
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 4,
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
