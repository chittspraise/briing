import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '@/supabaseClient';

const screenWidth = Dimensions.get('window').width;

const renderStars = (rating: number) => '⭐'.repeat(Math.round(rating));

const HomeScreen: React.FC = () => {
  type Order = {
    id: number;
    created_at: string;
    traveler_reward: number;
    price: number;
    vat_estimate: number;
    item_name: string;
    destination: string;
    source_country: string;
    wait_time: string;
    image_url?: string;
    name: string;
    rating: number;
    avatar: string;
    images: string[];
    time: string;
  };

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
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
        image_url
      `);

    setLoading(false);
    if (error) {
      console.error('Fetch error:', error);
    } else {
      const transformed = data.map((item: any) => ({
        ...item,
        name: 'Anonymous User',
        rating: 4,
        avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
        images: item.image_url ? [item.image_url] : [],
        time: new Date(item.created_at).toLocaleDateString(),
      }));
      setOrders(transformed);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <FlatList
        data={[]}
        ListHeaderComponent={
          <>
            <View style={styles.container}>
              <View style={styles.profileRow}>
                <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.avatar} />
                <View>
                  <Text style={styles.welcomeText}>Welcome</Text>
                  <Text style={styles.usernameText}>Chitts</Text>
                </View>
              </View>

              <View style={styles.headerSection}>
                <Text style={styles.headerText}>Shop Internationally</Text>
                <Text style={styles.subText}>Get anything delivered by travelers.</Text>
              </View>

              {/* Post New Order Button */}
              <TouchableOpacity
                style={styles.createOrderBtn}
                onPress={() => router.push('/OrdersPage')}
              >
                <Image
                  source={require('../../../assets/images/kkk.png')}
                  style={styles.createOrderImage}
                />
                <View style={styles.orderRow}>
                  <Ionicons name="add" size={18} color="#000" />
                  <Text style={styles.createOrderText}>Post New Order</Text>
                </View>
              </TouchableOpacity>

              {/* Travel Banner */}
              <TouchableOpacity
                style={styles.travelBanner}
                onPress={() => router.push('/travelPage')}
                activeOpacity={0.8}
              >
                <Image
                  source={require('../../../assets/images/travel-01-512.webp')}
                  style={styles.travelImage}
                />
                <View style={styles.travelOverlay}>
                  <Ionicons name="airplane" size={20} color="#000" style={styles.planeIcon} />
                  <Text style={styles.travelText}>Travel</Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Most Recent Orders</Text>
            </View>

            <FlatList
              data={orders}
              horizontal
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.horizontalScroll, { paddingHorizontal: 20 }]}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.profileRow}>
                    <Image source={{ uri: item.avatar }} style={styles.avatarSmall} />
                    <View>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.rating}>{renderStars(item.rating)} ({item.rating})</Text>
                      <Text style={styles.time}>{item.time}</Text>
                    </View>
                  </View>

                  <Text style={styles.productName}>{item.item_name}</Text>

                  <FlatList
                    data={item.images}
                    horizontal
                    keyExtractor={(img, index) => img + index}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item: img }) => (
                      <Image source={{ uri: img }} style={styles.productImage} />
                    )}
                    style={styles.imageSlider}
                  />

                  <Text style={styles.price}>R{item.traveler_reward}</Text>
                  <Text style={styles.product}>Price: R{item.price} + Tax: R{item.vat_estimate}</Text>

                  <TouchableOpacity style={styles.offerButton}>
                    <Text style={styles.offerButtonText}>Make your offer</Text>
                  </TouchableOpacity>

                  <View style={styles.infoBox}>
                    <Text style={styles.label}>Deliver to:</Text>
                    <Text style={styles.value}>{item.destination}</Text>
                    <Text style={styles.label}>From:</Text>
                    <Text style={styles.value}>{item.source_country}</Text>
                    <Text style={styles.label}>Wait time:</Text>
                    <Text style={styles.value}>{item.wait_time}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={{ color: '#fff', textAlign: 'center' }}>No recent orders.</Text>
              }
            />
          </>
        }
        renderItem={null}
        refreshing={loading}
        onRefresh={fetchOrders}
      />
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
  createOrderBtn: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  createOrderImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    backgroundColor: '#111',
    height: 260,
    justifyContent: 'flex-end',
    marginBottom: 25,
  },
  travelImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 12,
  },
  travelOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
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
    marginBottom: 15,
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
    width: 100,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  imageSlider: {
    marginBottom: 12,
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
});
