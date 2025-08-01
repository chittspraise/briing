import { stores } from '@/constants/stores';
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

const ExplorePage = () => {
  const [activeDestination, setActiveDestination] = useState(0);
  const [activeOffer, setActiveOffer] = useState(0);
  const [activeStore, setActiveStore] = useState(0);
  const [travelers, setTravelers] = useState<any[]>([]);
  const [loadingTravelers, setLoadingTravelers] = useState(true);
  const [confirmedOffers, setConfirmedOffers] = useState<any[]>([]);
  const [loadingConfirmedOffers, setLoadingConfirmedOffers] = useState(true);
  const [highestPayingDestinations, setHighestPayingDestinations] = useState<any[]>([]);
  const [loadingHighestPaying, setLoadingHighestPaying] = useState(true);
  const [mostPurchasedStores, setMostPurchasedStores] = useState<any[]>([]);
  const [loadingMostPurchased, setLoadingMostPurchased] = useState(true);

  const router = useRouter();
  const setTravelerId = useTravelerOrderStore((state) => state.setTravelerId);

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchTravelers(),
        fetchConfirmedOffers(),
        fetchHighestPayingDestinations(),
        fetchMostPurchasedStores(),
      ]);
    };
    fetchAllData();
  }, []);

  const fetchMostPurchasedStores = async () => {
    setLoadingMostPurchased(true);
    try {
      const { data, error } = await supabase.from('product_orders').select('store');
      if (error) throw error;

      const storeCounts = (data || []).reduce((acc, order) => {
        const store = order.store;
        if (store) acc[store] = (acc[store] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      const sortedStores = Object.entries(storeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6);

      const formattedStores = sortedStores.map(([name, count], index) => {
        const finalName = name.toLowerCase() === 'lg' ? 'Superbalist' : name;
        const storeData = stores.find(s => s.name.toLowerCase() === finalName.toLowerCase());
        return {
          id: `${finalName}-${index}`,
          name: finalName,
          purchases: count,
          link: storeData?.link || `https://www.${finalName.toLowerCase().replace(/\s+/g, '')}.com`,
          logo: storeData?.logo || `https://logo.clearbit.com/${finalName.toLowerCase().replace(/\s+/g, '')}.com`,
        };
      });
      setMostPurchasedStores(formattedStores);
    } catch (e) {
      console.error('Error fetching most purchased stores:', e);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch stores.' });
    } finally {
      setLoadingMostPurchased(false);
    }
  };

  const fetchHighestPayingDestinations = async () => {
    setLoadingHighestPaying(true);
    try {
      const { data, error } = await supabase
        .from('product_orders')
        .select('id, destination, traveler_reward, image_url');
      if (error) throw error;

      const { data: offersData, error: offersError } = await supabase
        .from('confirmed_orders')
        .select('order_id');
      if (offersError) throw offersError;

      const safeData = data || [];
      const safeOffersData = offersData || [];

      const offerCounts = safeOffersData.reduce((acc, offer) => {
        const order = safeData.find(o => o.id === offer.order_id);
        if (order?.destination) acc[order.destination] = (acc[order.destination] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      const destinationsByReward = safeData.reduce((acc, order) => {
        const { destination, traveler_reward, image_url } = order;
        if (destination) {
          if (!acc[destination]) {
            acc[destination] = { name: destination, reward: 0, orders: 0, imageUrl: null };
          }
          acc[destination].reward += traveler_reward || 0;
          acc[destination].orders += 1;
          if (!acc[destination].imageUrl && image_url) {
            acc[destination].imageUrl = image_url;
          }
        }
        return acc;
      }, {} as { [key: string]: { name: string; reward: number; orders: number; imageUrl: string | null } });

      const sortedDestinations = Object.values(destinationsByReward)
        .sort((a, b) => b.reward - a.reward)
        .slice(0, 6);

      const formattedDestinations = sortedDestinations.map((dest, index) => ({
        id: `${dest.name}-${index}`,
        name: dest.name,
        reward: dest.reward.toFixed(2),
        orders: dest.orders,
        offers: offerCounts[dest.name] || 0,
        imageUrl: `https://picsum.photos/seed/${dest.name}/800/600`,
      }));
      setHighestPayingDestinations(formattedDestinations);
    } catch (e) {
      console.error('Error fetching highest paying destinations:', e);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch destinations.' });
    } finally {
      setLoadingHighestPaying(false);
    }
  };

  const fetchConfirmedOffers = async () => {
    setLoadingConfirmedOffers(true);
    try {
      const { data: confirmedOrderIds, error: confirmedError } = await supabase
        .from('confirmed_orders')
        .select('order_id');
      if (confirmedError) throw confirmedError;

      if (confirmedOrderIds?.length) {
        const orderIds = confirmedOrderIds.map(o => o.order_id);
        const { data: orders, error: ordersError } = await supabase
          .from('product_orders')
          .select('destination, traveler_reward, image_url')
          .in('id', orderIds);
        if (ordersError) throw ordersError;

        const offersByDestination = (orders || []).reduce((acc, order) => {
          const { destination, traveler_reward, image_url } = order;
          if (destination) {
            if (!acc[destination]) {
              acc[destination] = { name: destination, reward: 0, imageUrl: null };
            }
            acc[destination].reward += traveler_reward || 0;
            if (!acc[destination].imageUrl && image_url) {
              acc[destination].imageUrl = image_url;
            }
          }
          return acc;
        }, {} as { [key: string]: { name: string; reward: number; imageUrl: string | null } });

        const formattedOffers = Object.values(offersByDestination).map((offer, index) => ({
          id: `${offer.name}-${index}`,
          name: offer.name,
          reward: offer.reward.toFixed(2),
          imageUrl: `https://picsum.photos/seed/${offer.name}/800/600`,
        }));
        setConfirmedOffers(formattedOffers);
      }
    } catch (e) {
      console.error('Error fetching confirmed offers:', e);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch offers.' });
    } finally {
      setLoadingConfirmedOffers(false);
    }
  };

  const fetchTravelers = async () => {
    setLoadingTravelers(true);
    try {
      const today = new Date().toISOString();
      const { data, error } = await supabase
        .from('travel')
        .select('*')
        .gte('departure_date', today)
        .order('departure_date', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching travelers:', error);
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch travelers.' });
        return;
      }
      
      if (!data) {
        setTravelers([]);
        return;
      }

      const userIds = data.map(item => item.user_id).filter(id => id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, image_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('rated_id, rating, comment, created_at')
        .in('rated_id', userIds)
        .order('created_at', { ascending: false });

      if (ratingsError) {
        console.error('Error fetching ratings:', ratingsError);
      }

      const ratingsMap = new Map<string, { total: number; count: number; comments: string[] }>();
      if (ratingsData) {
        for (const rating of ratingsData) {
          if (!ratingsMap.has(rating.rated_id)) {
            ratingsMap.set(rating.rated_id, { total: 0, count: 0, comments: [] });
          }
          const current = ratingsMap.get(rating.rated_id)!;
          current.total += rating.rating;
          current.count += 1;
          if (rating.comment) {
            current.comments.push(rating.comment);
          }
        }
      }

      const profilesMap = new Map(profiles?.map(p => [p.id, p.image_url]));

      const mappedTravelers = data.map((item, index) => {
        const userRating = ratingsMap.get(item.user_id!);
        const avgRating = userRating ? userRating.total / userRating.count : 5;
        const latestComment = userRating?.comments[0] || null;

        return {
          id: item.id || index,
          user_id: item.user_id!,
          name: item.traveler_name ?? 'Unknown',
          from: item.from_country ?? 'Unknown',
          to: item.to_country ?? 'Unknown',
          budget: item.notes?.match(/\d+/)?.[0] ?? 'N/A',
          departure_date: item.departure_date ?? 'N/A',
          return_date: item.return_date ?? '',
          is_round_trip: !!item.return_date,
          avatar: profilesMap.get(item.user_id) || 'https://randomuser.me/api/portraits/men/1.jpg',
          rating: avgRating,
          comment: latestComment,
        };
      });
      setTravelers(mappedTravelers);

    } catch (e) {
      console.error('Unexpected error:', e);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Unexpected error while fetching travelers.' });
    } finally {
      setLoadingTravelers(false);
    }
  };

  const handleScroll = (setIndex: (i: number) => void) => (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(index);
  };

  const handleDestinationPress = (destinationName: string, type: 'destinations' | 'offers') => {
    router.push({ pathname: '/destination-details', params: { destination: destinationName, type } });
  };

  const handleRequestDelivery = (travelerId: string) => {
    setTravelerId(travelerId);
    router.push({ pathname: '/customProduct', params: { travelerId } });
  };

  const openStore = (url: string, name: string) => {
    router.push({ pathname: '/storePage', params: { url, name } });
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    const stars = '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
    return (
      <Text style={styles.ratingText}>
        {stars} ({rating.toFixed(1)})
      </Text>
    );
  };

  const renderTravelerItem = ({ item }: { item: any }) => (
    <View style={styles.travelerCard}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.travelerInfo}>
        <Text style={styles.travelerName}>{item.name}</Text>
        {renderStars(item.rating)}
        {item.comment && <Text style={styles.commentText}>&quot;{item.comment}&quot;</Text>}
        <Text style={styles.travelerRoute}>
          {`${item.from} ➡️ ${item.to}`}
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
        <Text style={styles.travelerBudget}>{`Budget: R${item.budget}`}</Text>
        <TouchableOpacity style={styles.requestButton} onPress={() => handleRequestDelivery(item.user_id)}>
          <Text style={styles.requestButtonText}>Request Delivery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDestinationItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleDestinationPress(item.name, 'destinations')}>
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="contain" />
        <View style={styles.cardContent}>
          <Text style={styles.destName}>{item.name}</Text>
          {item.orders && item.offers ? (
            <Text style={styles.subText}>
              {`${item.orders} orders • ${item.offers} offers`}
            </Text>
          ) : null}
          <Text style={styles.rewardLabel}>Total Reward:</Text>
          <Text style={styles.rewardValue}>{`R${item.reward}`}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOfferItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleDestinationPress(item.name, 'offers')}>
        <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="contain" />
            <View style={styles.cardContent}>
                <Text style={styles.destName}>{item.name}</Text>
                <Text style={styles.rewardLabel}>Total Reward:</Text>
                <Text style={styles.rewardValue}>{`R${item.reward}`}</Text>
            </View>
        </View>
    </TouchableOpacity>
  );

  const renderStoreItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => openStore(item.link, item.name)}>
      <Image source={{ uri: item.logo }} style={styles.storeLogo} resizeMode="contain" />
      <View style={styles.cardContent}>
        <Text style={styles.destName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPaginationDots = (count: number, activeIndex: number) => (
    <View style={styles.paginationContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={`pagination-dot-${index}`}
          style={[styles.dot, index === activeIndex ? styles.activeDot : styles.inactiveDot]}
        />
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Image source={require('../../../assets/images/exploreimage.webp')} style={styles.bannerImage} />
      
      <Text style={styles.sectionTitle}>Upcoming Travelers</Text>
      {loadingTravelers ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginVertical: 20 }} />
      ) : travelers.length === 0 ? (
          <Text style={{ color: '#fff', marginLeft: 16 }}>No items found.</Text>
      ) : (
          <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={travelers}
              renderItem={renderTravelerItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingHorizontal: 10 }}
          />
      )}
      
      <Text style={styles.sectionTitle}>Highest Paying Travel Destinations</Text>
      {loadingHighestPaying ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginVertical: 20 }} />
      ) : highestPayingDestinations.length === 0 ? (
          <Text style={{ color: '#fff', marginLeft: 16 }}>No items found.</Text>
      ) : (
          <>
              <FlatList
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  data={highestPayingDestinations}
                  renderItem={renderDestinationItem}
                  keyExtractor={(item) => item.id.toString()}
                  onScroll={handleScroll(setActiveDestination)}
              />
              {renderPaginationDots(highestPayingDestinations.length, activeDestination)}
          </>
      )}

      <Text style={styles.sectionTitle}>Confirmed Offers From Around the World</Text>
      {loadingConfirmedOffers ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginVertical: 20 }} />
      ) : confirmedOffers.length === 0 ? (
          <Text style={{ color: '#fff', marginLeft: 16 }}>No items found.</Text>
      ) : (
          <>
              <FlatList
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  data={confirmedOffers}
                  renderItem={renderOfferItem}
                  keyExtractor={(item) => item.id.toString()}
                  onScroll={handleScroll(setActiveOffer)}
              />
              {renderPaginationDots(confirmedOffers.length, activeOffer)}
          </>
      )}

      <Text style={styles.sectionTitle}>Most Purchased From Store</Text>
      {loadingMostPurchased ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginVertical: 20 }} />
      ) : mostPurchasedStores.length === 0 ? (
          <Text style={{ color: '#fff', marginLeft: 16 }}>No stores found.</Text>
      ) : (
          <>
              <FlatList
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  data={mostPurchasedStores}
                  renderItem={renderStoreItem}
                  keyExtractor={(item) => item.id.toString()}
                  onScroll={handleScroll(setActiveStore)}
              />
              {renderPaginationDots(mostPurchasedStores.length, activeStore)}
          </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  bannerImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
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
  ratingText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 6,
  },
  commentText: {
    color: '#aaa',
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 8,
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