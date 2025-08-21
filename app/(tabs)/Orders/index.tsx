import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/supabaseClient';
import { useRouter } from 'expo-router';

type OrderRequest = {
  id: number;
  created_at: string;
  traveler_reward: number;
  price: number;
  vat_estimate: number;
  item_name: string;
  quantity: number;
  destination: string | null;
  source_country: string | null;
  wait_time: string | null;
  image_url: string | null;
  user_id: string;
  store: string | null;
  first_name: string;
  avatar: string;
  rating: number;
  images: string[];
  time: string;
  details: string | null;
};

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  return (
    '★'.repeat(fullStars) +
    (halfStar ? '½' : '') +
    '☆'.repeat(emptyStars)
  );
};

function generateChatId(orderId: string, userA: string, userB: string): string {
  const [first, second] = [userA, userB].sort();
  return `${orderId}_${first}_${second}`;
}

const OrderPage = () => {
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [minReward, setMinReward] = useState('');
  const [maxReward, setMaxReward] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [originFilter, setOriginFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Failed to fetch user:', error);
        return;
      }
      setCurrentUserId(data.user?.id ?? null);
    };

    fetchCurrentUser();
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);

    const { data: ordersData, error: ordersError } = await supabase
      .from('product_orders')
      .select(`
        id,
        created_at,
        traveler_reward,
        price,
        vat_estimate,
        item_name,
        quantity,
        destination,
        source_country,
        wait_time,
        image_url,
        user_id,
        store,
        details,
        product_url
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Fetch requests error:', ordersError);
      setLoading(false);
      return;
    }

    if (!ordersData || ordersData.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const userIds = Array.from(
      new Set(
        ordersData.map((o) => o.user_id).filter((id) => id !== null)
      )
    );

    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, image_url')
      .in('id', userIds);

    if (profilesError) {
      console.error('Fetch profiles error:', profilesError);
      setLoading(false);
      return;
    }

    const { data: ratingsData, error: ratingsError } = await supabase
      .from('ratings')
      .select('rated_id, rating')
      .in('rated_id', userIds);

    if (ratingsError) {
      console.error('Fetch ratings error:', ratingsError);
      // We can continue without ratings if this fails
    }

    const ratingsMap = new Map<string, { total: number; count: number }>();
    if (ratingsData) {
      for (const rating of ratingsData) {
        if (!ratingsMap.has(rating.rated_id)) {
          ratingsMap.set(rating.rated_id, { total: 0, count: 0 });
        }
        const current = ratingsMap.get(rating.rated_id)!;
        current.total += rating.rating;
        current.count += 1;
      }
    }

    const profilesMap = new Map(
      (profilesData ?? []).map((p) => [p.id, p])
    );

    const mappedOrders = ordersData.map((order) => {
      const profile = profilesMap.get(order.user_id);
      const userRating = ratingsMap.get(order.user_id);
      const avgRating = userRating ? userRating.total / userRating.count : 5;

      return {
        ...order,
        first_name: profile?.first_name ?? 'Anonymous User',
        avatar:
          profile?.image_url && profile.image_url.trim() !== ''
            ? profile.image_url
            : `https://i.pravatar.cc/150?u=${order.user_id}`,
        rating: avgRating,
        images:
          order.image_url && order.image_url.trim() !== ''
            ? [order.image_url.trim()]
            : [],
        time: new Date(order.created_at).toLocaleDateString(),
      };
    });

    setRequests(mappedOrders);
    setLoading(false);
  };

  const applyFilters = () => {
    const min = parseFloat(minReward) || 0;
    const max = parseFloat(maxReward) || Infinity;

    return requests.filter((r) =>
      r.traveler_reward >= min &&
      r.traveler_reward <= max &&
      (r.destination ?? '').toLowerCase().includes(destinationFilter.toLowerCase()) &&
      (r.source_country ?? '').toLowerCase().includes(originFilter.toLowerCase()) &&
      (r.item_name ?? '').toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const dataToRender = applyFilters();

  return (
    <View style={styles.container}>
      {/* Top Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={styles.tabText}>All Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => router.push('/Orders/my_orders')}
        >
          <Text style={styles.tabText}>My Orders</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dataToRender}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            <TextInput
              style={styles.input}
              placeholder="Search product..."
              placeholderTextColor="#aaa"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity
              style={styles.hamburgerButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons name="menu" size={24} color="#fff" />
              <Text style={styles.hamburgerText}>Filters</Text>
            </TouchableOpacity>
            {showFilters && (
              <View style={styles.filterBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Min reward"
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                  value={minReward}
                  onChangeText={setMinReward}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Max reward"
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                  value={maxReward}
                  onChangeText={setMaxReward}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Destination"
                  placeholderTextColor="#aaa"
                  value={destinationFilter}
                  onChangeText={setDestinationFilter}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Origin"
                  placeholderTextColor="#aaa"
                  value={originFilter}
                  onChangeText={setOriginFilter}
                />
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setShowFilters(false)}
                >
                  <Text style={styles.filterButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => {
          const chatId = currentUserId
            ? generateChatId(item.id.toString(), currentUserId, item.user_id)
            : '';

          return (
            <View style={styles.card}>
              {/* Profile Info */}
              <View style={styles.profileRow}>
                {item.avatar ? (
                  <Image source={{ uri: item.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: '#444', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="person" size={24} color="#999" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.first_name}</Text>
                  {item.store ? (
                    <Text style={styles.store}>Store: {item.store}</Text>
                  ) : null}
                  <Text style={styles.rating}>
                    {renderStars(item.rating)} ({item.rating.toFixed(1)})
                  </Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
              </View>

              <View style={styles.productNameContainer}>
                <Text style={styles.productName}>{item.item_name}</Text>
                <Text style={styles.quantityText}> (x{item.quantity})</Text>
              </View>

              {item.images.length > 0 && (
                <FlatList
                  horizontal
                  data={item.images}
                  keyExtractor={(uri) => uri}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item: uri }) =>
                    uri ? (
                      <Image source={{ uri }} style={styles.productImage} />
                    ) : null
                  }
                />
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={styles.rewardLabel}>Reward: </Text>
                <Text style={styles.price}>ZAR{item.traveler_reward}</Text>
              </View>
              <Text style={styles.product}>
                Price: ZAR{item.price} + Tax: ZAR{item.vat_estimate}
              </Text>

              {item.product_url && (
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => Linking.openURL(item.product_url)}
                >
                  <Text style={styles.linkButtonText}>View Product</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.offerButton}
                onPress={() => {
                  if (!currentUserId) return alert('Please log in to chat.');
                  router.push({
                    pathname: '/(tabs)/Messages/[chatId]',
                    params: {
                      chatId,
                      receiverId: item.user_id,
                      senderId: currentUserId,
                      otherUserName: item.first_name,
                      otherUserAvatar: item.avatar,
                      rating: item.rating,
                      productName: item.item_name,
                      productImage: item.image_url,
                    },
                  });
                }}
              >
                <Text style={styles.offerButtonText}>Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.offerButton, { backgroundColor: '#0a0' }]}
                onPress={() => {
                  if (!currentUserId) return alert('Please log in to accept.');
                  router.push({
                    pathname: '/(tabs)/Orders/confirm/[confirmOrder]',
                    params: { confirmOrder: item.id.toString() },
                  });
                }}
              >
                <Text style={[styles.offerButtonText, { color: '#fff' }]}>Accept</Text>
              </TouchableOpacity>

              <View style={styles.infoBox}>
                <Text style={styles.label}>Deliver to:</Text>
                <Text style={styles.value}>{item.destination ?? '-'}</Text>
                <Text style={styles.label}>From:</Text>
                <Text style={styles.value}>{item.source_country ?? '-'}</Text>
                <Text style={styles.label}>Wait time:</Text>
                <Text style={styles.value}>{item.wait_time ?? '-'}</Text>
                {item.details && (
                  <>
                    <Text style={styles.label}>Description:</Text>
                    <Text style={styles.value}>{item.details}</Text>
                  </>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <Text style={{ color: '#fff', textAlign: 'center' }}>No requests found.</Text>
          )
        }
        refreshing={loading}
        onRefresh={fetchRequests}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#000',
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#444',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomColor: '#fff',
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // ... [Keep rest of your existing styles]
  input: {
    backgroundColor: '#111',
    color: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderColor: '#333',
    borderWidth: 1,
  },
  hamburgerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  hamburgerText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  filterBox: {
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  filterButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderColor: '#fff',
    borderWidth: 0.5,
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
    borderColor: '#fff',
    borderWidth: 1,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  store: {
    color: '#aaa',
    fontSize: 13,
    fontStyle: 'italic',
  },
  rating: {
    color: '#ccc',
    fontSize: 14,
  },
  time: {
    color: '#888',
    fontSize: 12,
  },
  productNameContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flexShrink: 1,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
  productImage: {
    width: 140,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#222',
    resizeMode: 'contain',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'green',
  },
  rewardLabel: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  product: {
    fontSize: 13,
    color: '#ccc',
    marginBottom: 16,
  },
  offerButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  offerButtonText: {
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  linkButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  linkButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  infoBox: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 10,
  },
  label: {
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
  },
  value: {
    color: '#ccc',
  },
});

export default OrderPage;