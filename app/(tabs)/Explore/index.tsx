import { useTravelerOrderStore } from '@/app/store/travelerOrderStore';
import { supabase } from '@/supabaseClient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

const { width } = Dimensions.get('window');

const destinations = [
  {
    id: '2',
    name: 'New York',
    orders: 750,
    offers: 480,
    reward: '20,123.45',
    imageUrl:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    name: 'Paris',
    orders: 680,
    offers: 400,
    reward: '18,500.00',
    imageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    name: 'Tokyo',
    orders: 900,
    offers: 600,
    reward: '30,000.00',
    imageUrl:
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
  },
];

const confirmedOffers = [
  {
    id: '1',
    name: 'Berlin',
    reward: '12,000.00',
    imageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'Sydney',
    reward: '9,850.50',
    imageUrl:
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d6?auto=format&fit=crop&w=800&q=80',
  },
];

const popularStores = [
  {
    id: '3',
    name: 'Amazon',
    logo: 'https://1000logos.net/wp-content/uploads/2016/10/Amazon-logo-meaning.jpg',
    purchases: 4200,
  },
  {
    id: '1',
    name: 'Apple Store',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    purchases: 3520,
  },
  {
    id: '2',
    name: 'Alibaba',
    logo: 'https://seeklogo.com/images/A/alibaba-logo-3B30F5D998-seeklogo.com.png',
    purchases: 2780,
  },
];

const ExplorePage = () => {
  const [activeDestination, setActiveDestination] = useState(0);
  const [activeOffer, setActiveOffer] = useState(0);
  const [activeStore, setActiveStore] = useState(0);
  const [travelers, setTravelers] = useState<any[]>([]);
  const [loadingTravelers, setLoadingTravelers] = useState(true);

  const router = useRouter();
  const setTravelerId = useTravelerOrderStore((state) => state.setTravelerId);

  useEffect(() => {
    fetchTravelers();
  }, []);

  const fetchTravelers = async () => {
    setLoadingTravelers(true);
    try {
      const { data, error } = await supabase
        .from('travel')
        .select('*')
        .order('departure_date', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching travelers:', error);
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch travelers.' });
      } else if (data) {
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        const validTravelers = data.filter(item => item.user_id && typeof item.user_id === 'string' && uuidRegex.test(item.user_id));

        const mappedTravelers = validTravelers.map(item => ({
          id: item.user_id!,
          name: item.traveler_name ?? 'Unknown',
          from: item.from_country ?? 'Unknown',
          to: item.to_country ?? 'Unknown',
          budget: item.notes?.match(/\d+/)?.[0] ?? 'N/A',
          departure_date: item.departure_date ?? 'N/A',
          return_date: item.return_date ?? '',
          is_round_trip: !!item.return_date,
          avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
        }));
        setTravelers(mappedTravelers);
      }
    } catch (e) {
      console.error('Unexpected error:', e);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Unexpected error while fetching travelers.' });
    } finally {
      setLoadingTravelers(false);
    }
  };

  const handleScroll =
    (setIndex: (i: number) => void) =>
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / width);
      setIndex(index);
    };

  const handleRequestDelivery = (travelerId: string) => {
    setTravelerId(travelerId);
    router.push({ pathname: '/customProduct', params: { travelerId } });
  };

  const renderCard = (item: any) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
      <View style={styles.cardContent}>
        <Text style={styles.destName}>{item.name}</Text>
        {item.orders && item.offers && (
          <Text style={styles.subText}>
            {item.orders} orders • {item.offers} offers
          </Text>
        )}
        <Text style={styles.rewardLabel}>Reward:</Text>
        <Text style={styles.rewardValue}>R{item.reward}</Text>
      </View>
    </View>
  );

  const renderTraveler = ({ item }: { item: any }) => (
    <View style={styles.travelerCard}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.travelerInfo}>
        <Text style={styles.travelerName}>{item.name}</Text>
        <Text style={styles.travelerRoute}>
          {item.from} ➡️ {item.to}
        </Text>
        <View style={styles.tripDetailsRow}>
          <View style={styles.tripDetail}>
            <Text style={styles.tripLabel}>Departure</Text>
            <Text style={styles.tripValue}>{item.departure_date}</Text>
          </View>
          {item.is_round_trip && (
            <View style={styles.tripDetail}>
              <Text style={styles.tripLabel}>Return</Text>
              <Text style={styles.tripValue}>{item.return_date}</Text>
            </View>
          )}
        </View>
        <Text style={styles.travelerBudget}>Budget: R{item.budget}</Text>

        <TouchableOpacity
          style={styles.requestButton}
          onPress={() => handleRequestDelivery(item.id)}
        >
          <Text style={styles.requestButtonText}>Request Delivery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Upcoming Travelers</Text>
      {loadingTravelers ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginVertical: 20 }} />
      ) : travelers.length === 0 ? (
        <Text style={{ color: '#fff', marginLeft: 16 }}>No upcoming travelers found.</Text>
      ) : (
        <FlatList
          data={travelers}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderTraveler}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />
      )}

      <Text style={styles.sectionTitle}>Highest Paying Travel Destinations</Text>
      <FlatList
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={destinations}
        renderItem={({ item }) => renderCard(item)}
        keyExtractor={(item) => item.id}
        onScroll={handleScroll(setActiveDestination)}
      />
      <PaginationDots count={destinations.length} activeIndex={activeDestination} />

      <Text style={styles.sectionTitle}>Confirmed Offers From Around the World</Text>
      <FlatList
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={confirmedOffers}
        renderItem={({ item }) => renderCard(item)}
        keyExtractor={(item) => item.id}
        onScroll={handleScroll(setActiveOffer)}
      />
      <PaginationDots count={confirmedOffers.length} activeIndex={activeOffer} />

      <Text style={styles.sectionTitle}>Most Purchased From Store</Text>
      <FlatList
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={popularStores}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.logo }} style={styles.storeLogo} resizeMode="contain" />
            <View style={styles.cardContent}>
              <Text style={styles.destName}>{item.name}</Text>
              <Text style={styles.subText}>{item.purchases} total purchases</Text>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        onScroll={handleScroll(setActiveStore)}
      />
      <PaginationDots count={popularStores.length} activeIndex={activeStore} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 12,
    color: '#fff',
  },
  card: {
    width: width * 0.92,
    marginHorizontal: width * 0.04,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#ddd',
  },
  storeLogo: {
    width: '100%',
    height: 160,
    marginTop: 10,
  },
  cardContent: {
    padding: 12,
    alignItems: 'center',
  },
  destName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    color: '#000',
  },
  subText: {
    fontSize: 12,
    color: '#444',
    marginBottom: 6,
  },
  rewardLabel: {
    fontSize: 12,
    color: '#555',
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
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
  travelerCard: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 10,
    width: width * 0.78,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 14,
  },
  travelerInfo: {
    flex: 1,
  },
  travelerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  travelerRoute: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 10,
  },
  travelerBudget: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginTop: 10,
  },
  tripDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  tripDetail: {
    marginRight: 24,
  },
  tripLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#aaa',
  },
  tripValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  requestButton: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  requestButtonText: {
    color: '#000',
    fontWeight: '700',
  },
});

export default ExplorePage;
