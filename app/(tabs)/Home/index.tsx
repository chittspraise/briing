import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '@/supabaseClient';
import { stores } from '../../../constants/stores';

const screenWidth = Dimensions.get('window').width;

const renderStars = (rating: number) => '⭐'.repeat(Math.round(rating));



const PaginationDots = ({ count, activeIndex }: { count: number; activeIndex: number }) => (
  <View style={styles.paginationContainer}>
    {Array.from({ length: count }).map((_, index) => (
      <View
        key={index}
        style={[
          styles.dot,
          index === activeIndex ? styles.activeDot : styles.inactiveDot,
        ]}
      />
    ))}
  </View>
);

const HomeScreen: React.FC = () => {
  type Order = {
    id: number;
    created_at: string;
    traveler_reward: number;
    price: number;
    vat_estimate: number;
    item_name: string;
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
  };

  const [orders, setOrders] = useState<Order[]>([]);
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [firstName, setFirstName] = useState('');
  const [activeTrendingIndex, setActiveTrendingIndex] = useState(0);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error('Failed to fetch user:', error);
        return;
      }
      setCurrentUserId(user.id);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Failed to fetch profile:', profileError);
      } else if (profile) {
        setFirstName(profile.first_name);
      }
    };

    fetchCurrentUser();
    fetchOrders();
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      const response = await fetch('https://dummyjson.com/products?limit=10');
      const data = await response.json();
      const products = data.products.map((p: any) => ({
        item_name: p.title,
        image_url: p.thumbnail,
        price: p.price.toString(),
        store: p.brand || 'Online Store',
        source_country: 'Various',
      }));
      setTrendingProducts(products);
    } catch (error) {
      console.error('Error fetching trending products from API:', error);
    }
  };

  const fetchOrders = async () => {
    const { data: ordersData, error: ordersError } = await supabase
      .from('product_orders')
      .select(`
        id,
        created_at,
        traveler_reward,
        price,
        vat_estimate,
        item_name,
        destination,
        source_country,
        wait_time,
        image_url,
        user_id,
        store
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Fetch requests error:', ordersError);
      return;
    }

    if (!ordersData || ordersData.length === 0) {
      setOrders([]);
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
      return;
    }

    const profilesMap = new Map(
      (profilesData ?? []).map((p) => [p.id, p])
    );

    const mappedOrders = ordersData.map((order) => {
      const profile = profilesMap.get(order.user_id);
      return {
        ...order,
        first_name: profile?.first_name ?? 'Anonymous User',
        avatar:
          profile?.image_url && profile.image_url.trim() !== ''
            ? profile.image_url
            : 'https://randomuser.me/api/portraits/lego/1.jpg',
        rating: 4,
        images:
          order.image_url && order.image_url.trim() !== ''
            ? [order.image_url.trim()]
            : [],
      };
    });

    setOrders(mappedOrders);
  };

  const openStore = (url: string, name: string) => {
    router.push({ pathname: "/storePage", params: { url, name } });
  };

  const handleScroll =
    (setIndex: (i: number) => void) =>
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / (screenWidth * 0.8));
      setIndex(index);
    };

  const renderStoreCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.storeCard} onPress={() => openStore(item.link, item.name)}>
      <Image source={{ uri: item.logo }} style={styles.storeLogo} />
      <Text style={styles.storeName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderTrendingProductCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/ProductPage', params: { ...item } })}>
      <Image source={{ uri: item.image_url }} style={styles.productImage} />
      <Text style={styles.productName} numberOfLines={1}>{item.item_name}</Text>
      <Text style={styles.price}>ZAR{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.profileRow}>
            <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.avatar} />
            <View>
              <Text style={styles.welcomeText}>Welcome</Text>
              <Text style={styles.usernameText}>{firstName || 'User'}</Text>
            </View>
          </View>

          <View style={styles.headerSection}>
            <Text style={styles.headerText}>Shop Internationally</Text>
            <Text style={styles.subText}>Get anything delivered by travelers.</Text>
          </View>

          <TouchableOpacity
            style={styles.createOrderBtn}
            onPress={() => router.push('/OrdersPage')}
          >
            <Image
              source={require('../../../assets/images/gadgwts.jpg')}
              style={styles.createOrderImage}
            />
            <View style={styles.orderRow}>
              <Ionicons name="add" size={20} color="#000" />
              <Text style={styles.createOrderText}>Post New Order</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.sectionDescription}>Travelling? &quot;Briing&quot; some items for shoppers and get a healthy reward.</Text>

          <TouchableOpacity
            style={[styles.travelBanner, { marginTop: 20 }]}
            onPress={() => router.push('/travelPage')}
          >
            <Image
              source={require('../../../assets/images/ChatGPT Image Jul 26, 2025, 09_31_10 AM.png')}
              style={styles.travelImage}
            />
            <View style={styles.travelOverlay}>
              <Ionicons name="airplane" size={20} color="#000" style={styles.planeIcon} />
              <Text style={styles.travelText}>Travel</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.storesSection}>
            <View style={styles.storesSectionHeader}>
            <Text style={styles.sectionTitle}>ORDER FROM ONLINE STORE</Text>
            <TouchableOpacity onPress={() => router.push('/all-stores')}>
              <Text style={styles.seeAllText}>SEE ALL</Text>
            </TouchableOpacity>
          </View>
            <FlatList
              data={stores.slice(0, 5)}
              renderItem={renderStoreCard}
              keyExtractor={(item) => item.name}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storeList}
            />
            <FlatList
              data={stores.slice(5, 10)}
              renderItem={renderStoreCard}
              keyExtractor={(item) => item.name}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storeList}
            />
          </View>

          <View style={styles.storesSection}>
            <Text style={styles.sectionTitle}>TRENDING PRODUCTS ON BRIING</Text>
            <FlatList
              data={trendingProducts}
              renderItem={renderTrendingProductCard}
              keyExtractor={(item) => item.item_name}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll(setActiveTrendingIndex)}
              contentContainerStyle={styles.storeList}
            />
            <PaginationDots count={trendingProducts.length} activeIndex={activeTrendingIndex} />
          </View>

          <Text style={styles.sectionTitle}>Most Recent Orders</Text>
        </View>

        <FlatList
          data={orders}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={[styles.horizontalScroll, { paddingHorizontal: 20 }]}
          renderItem={({ item }) => {
            const chatId = currentUserId
              ? `${item.id.toString()}_${currentUserId}_${item.user_id}`
              : '';

            return (
              <View style={styles.card}>
                <View style={styles.profileRow}>
                  {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={styles.avatarSmall} />
                  ) : (
                    <View style={[styles.avatarSmall, { backgroundColor: '#444', justifyContent: 'center', alignItems: 'center' }]}>
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
                    <Text style={styles.time}>{new Date(item.created_at).toLocaleDateString()}</Text>
                  </View>
                </View>

                <Text style={styles.productName}>{item.item_name}</Text>

                {item.images.length > 0 && (
                  <FlatList
                    horizontal
                    data={item.images}
                    keyExtractor={(uri) => uri}
                    showsHorizontalScrollIndicator={true}
                    renderItem={({ item: uri }) =>
                      uri ? (
                        <Image source={{ uri }} style={styles.productImage} />
                      ) : null
                    }
                  />
                )}

                <Text style={styles.price}>Reward: ZAR {item.traveler_reward}</Text>
                <Text style={styles.product}>
                  Price: ZAR{item.price} + Tax: ZAR{item.vat_estimate}
                </Text>

                <TouchableOpacity
                  style={styles.offerButton}
                  onPress={() => {
                    if (!currentUserId) return alert('Please log in to chat.');
                    router.push({
                      pathname: '/Orders/[chatId]',
                      params: {
                        chatId,
                        receiverId: item.user_id,
                        senderId: currentUserId,
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
                </View>
              </View>
            );
          }}
          />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: '#000',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  welcomeText: {
    color: '#bbb',
    fontSize: 14,
  },
  usernameText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSection: {
    marginBottom: 30,
  },
  headerText: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 4,
    fontWeight: '700',
  },
  subText: {
    fontSize: 14,
    color: '#bbb',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  createOrderBtn: {
    backgroundColor: '#000',
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    flexDirection: 'column',
    height: 290,
    position: 'relative',
  },
  createOrderImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '100%',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  createOrderText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  travelBanner: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    marginBottom: 25,
  },
  travelImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 12,
  },
  travelOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignSelf: 'stretch',
    marginTop: 10,
  },
  planeIcon: {
    marginRight: 6,
  },
  travelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  horizontalScroll: {
    gap: 15,
  },
  card: {
    width: screenWidth * 0.8,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginRight: 15,
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
  },
  store: {
    color: '#aaa',
    fontSize: 13,
    fontStyle: 'italic',
  },
  rating: {
    color: '#bbb',
    fontSize: 12,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  productName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  
  price: {
    color: '#0f0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  product: {
    color: '#ccc',
    fontSize: 13,
    marginBottom: 10,
  },
  offerButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  offerButtonText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoBox: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 10,
    marginTop: 10,
  },
  label: {
    color: '#aaa',
    fontSize: 12,
  },
  value: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 6,
  },
  storesSection: {
    marginBottom: 20,
  },
  storesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  storeList: {
    paddingVertical: 10,
  },
  storeCard: {
    alignItems: 'center',
    marginRight: 15,
  },
  storeLogo: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 5,
    backgroundColor: '#FFFFFF',
    resizeMode: 'contain',
  },
  storeName: {
    color: '#fff',
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  inactiveDot: {
    backgroundColor: '#777',
  },
});
