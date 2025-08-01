import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '@/supabaseClient';
import { openStripeCheckout, setupStripePaymentSheet } from '@/app/lib/stripe';
import RatingModal from '@/components/RatingModal';

type Order = {
  id: number;
  user_id: string;
  item_name: string;
  store: string;
  price: number;
  quantity: number;
  vat_estimate: number;
  traveler_reward: number;
  estimated_total: number;
  platform_fee: number;
  processing_fee: number;
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
  details: string | null;
};

type Rating = {
  id: number;
  order_id: number;
  rater_id: string;
  rated_id: string;
  rating: number;
  comment: string;
};

const STATUS_CHAIN = ['pending', 'accepted', 'paid', 'purchased', 'intransit', 'delivered', 'received'];
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

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [dropdownsVisible, setDropdownsVisible] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);

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
    const { data: productOrders } = await supabase
      .from('product_orders')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: confirmedOrders } = await supabase.from('confirmed_orders').select('*');
    
    const filteredOrders = (productOrders || []).filter(order => {
      const confirmed = confirmedOrders?.find(co => co.order_id === order.id);
      const isDeclined = order.status === 'declined' || confirmed?.status === 'declined';
      const isCancelled = order.status === 'cancelled';

      if ((isDeclined || isCancelled) && (order.traveler_id === userId || confirmed?.traveler_id === userId)) {
        return false;
      }
      
      return (
        order.user_id === userId ||
        confirmed?.shopper_id === userId ||
        confirmed?.traveler_id === userId ||
        order.traveler_id === userId
      );
    });

    const userIds = Array.from(new Set(filteredOrders.map(o => o.user_id).filter(id => id)));
    const travelerIds = Array.from(new Set(filteredOrders.map(o => o.traveler_id).filter(id => id)));
    const allUserIds = [...new Set([...userIds, ...travelerIds])];

    const { data: profiles } = await supabase.from('profiles').select('id, first_name, image_url').in('id', allUserIds);
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    const { data: ratingsData } = await supabase.from('ratings').select('rated_id, rating').in('rated_id', allUserIds);
    
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
    
    const orderIds = filteredOrders.map(o => o.id);
    const { data: orderRatingsData } = await supabase.from('ratings').select('*').in('order_id', orderIds);
    setRatings(orderRatingsData || []);

    const enriched: Order[] = filteredOrders.map(order => {
      const confirmed = confirmedOrders?.find(co => co.order_id === order.id);
      const travelerId = confirmed?.traveler_id || order.traveler_id;
      const shopperId = confirmed?.shopper_id || order.user_id;

      const relevantUser = userId === shopperId ? profileMap.get(travelerId) : profileMap.get(shopperId);
      const relevantUserId = userId === shopperId ? travelerId : shopperId;

      const userRating = ratingsMap.get(relevantUserId);
      const avgRating = userRating ? userRating.total / userRating.count : 5;

      return {
        ...order,
        confirmed_id: confirmed?.id,
        shopper_id: shopperId,
        traveler_id: travelerId,
        first_name: relevantUser?.first_name || 'Unknown',
        avatar: relevantUser?.image_url,
        rating: avgRating,
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

  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (!ratingOrder || !currentUserId) return;

    const raterId = currentUserId;
    const ratedId =
      raterId === ratingOrder.user_id ? ratingOrder.traveler_id : ratingOrder.user_id;

    if (!ratedId) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not determine who to rate.' });
      return;
    }

    const { error } = await supabase.from('ratings').insert([
      {
        order_id: ratingOrder.id,
        rater_id: raterId,
        rated_id: ratedId,
        rating,
        comment,
      },
    ]);

    if (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to submit rating.' });
    } else {
      Toast.show({ type: 'success', text1: 'Success', text2: 'Rating submitted.' });
      if (currentUserId) {
        fetchOrders(currentUserId);
      }
    }
    setRatingModalVisible(false);
    setRatingOrder(null);
  };

  const updateStatus = async (order: Order, newStatus: string) => {
    const currentIndex = STATUS_CHAIN.indexOf(order.status);
    const newIndex = STATUS_CHAIN.indexOf(newStatus);

    if (newStatus !== 'cancel' && newIndex <= currentIndex) {
      Toast.show({ type: 'error', text1: 'Invalid Status Update', text2: 'You cannot go back in status.' });
      return;
    }
    if (newStatus === 'received' && order.status !== 'delivered') {
      Toast.show({ type: 'error', text1: 'Invalid Status Update', text2: 'Order must be delivered to be received.' });
      return;
    }

    if (newStatus === 'accepted') {
      router.push({ pathname: '/(tabs)/Orders/confirm/[confirmOrder]', params: { confirmOrder: order.id.toString() } });
      return;
    }

    try {
      const { error: productOrderError } = await supabase.from('product_orders').update({ status: newStatus }).eq('id', order.id);
      if (productOrderError) throw new Error(`Failed to update product order: ${productOrderError.message}`);

      if (order.confirmed_id) {
        const { error: confirmedOrderError } = await supabase.from('confirmed_orders').update({ status: newStatus }).eq('id', order.confirmed_id);
        if (confirmedOrderError) throw new Error(`Failed to update confirmed order: ${confirmedOrderError.message}`);
      }

      Toast.show({ type: 'success', text1: 'Success', text2: 'Status updated successfully.' });

      if (newStatus === 'received') {
        setRatingOrder(order);
        setRatingModalVisible(true);
      }

      if (newStatus === 'received' && order.traveler_id) {
        const {
          price: itemPrice,
          vat_estimate,
          traveler_reward,
          estimated_total,
          platform_fee,
          processing_fee
        } = order;

        // Fee is 10% of the total checkout amount paid by the shopper.
        const platformFeeForTraveler = estimated_total * 0.10;
        
        // The traveler's gross earning.
        const travelerGross = itemPrice + traveler_reward;

        // The final amount credited to the traveler's wallet.
        const payoutAmount = travelerGross - platformFeeForTraveler;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', order.traveler_id)
          .single();
        if (profileError) throw new Error(`Failed to fetch traveler profile: ${profileError.message}`);
        if (!profile) throw new Error(`Traveler profile not found for id: ${order.traveler_id}`);
        
        const newBalance = (profile.wallet_balance || 0) + payoutAmount;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ wallet_balance: newBalance })
          .eq('id', order.traveler_id);
        if (updateError) throw new Error(`Failed to update traveler wallet: ${updateError.message}`);
        
        const transactionDescription = `Shopper Checkout Breakdown:\n` +
          `Item Price: ZAR ${itemPrice.toFixed(2)}\n` +
          `VAT (Est.): ZAR ${vat_estimate.toFixed(2)}\n` +
          `Platform Fee: ZAR ${platform_fee.toFixed(2)}\n` +
          `Processing Fee: ZAR ${processing_fee.toFixed(2)}\n` +
          `Traveler Reward: ZAR ${traveler_reward.toFixed(2)}\n` +
          `--------------------\n` +
          `Total Checkout: ZAR ${estimated_total.toFixed(2)}\n\n` +
          `Your Payout:\n` +
          `Platform Fee @ 10% of Total: -ZAR ${platformFeeForTraveler.toFixed(2)}\n` +
          `Net Amount Credited: ZAR ${payoutAmount.toFixed(2)}`;
        
        const { error: transactionError } = await supabase
          .from('wallet_transactions')
          .insert([{
            user_id: order.traveler_id,
            amount: payoutAmount,
            type: 'reward',
            description: transactionDescription,
            source: `order_${order.id}`,
          }]);
        if (transactionError) throw new Error(`Failed to create transaction record: ${transactionError.message}`);

        Toast.show({ type: 'success', text1: 'Traveler Credited', text2: `ZAR ${payoutAmount.toFixed(2)} has been paid.` });
      }

    } catch (e: any) {
      console.error('Error during status update process:', e);
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'An unexpected error occurred.' });
    } finally {
      if (currentUserId) {
        fetchOrders(currentUserId);
      }
    }
  };

  const handleCheckout = async (order: Order) => {
    const total = order.estimated_total;
    try {
      await setupStripePaymentSheet(total);
      await openStripeCheckout();
      await updateStatus(order, 'paid');
      Toast.show({ type: 'success', text1: 'Success', text2: 'Payment completed successfully.' });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Payment Error', text2: err.message });
    }
  };

  const renderStatusBar = (status: string) => {
    const index = STATUS_CHAIN.indexOf(status);
    return (
      <View style={{ flexDirection: 'row', marginVertical: 8 }}>
        {STATUS_CHAIN.map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 6,
              marginHorizontal: 2,
              backgroundColor: status === 'cancel' ? 'red' : i <= index ? 'green' : '#555',
            }}
          />
        ))}
      </View>
    );
  };

  const renderCard = (item: Order) => {
    const shopperConfirmed = item.shopper_id === currentUserId;
    const isCreator = item.user_id === currentUserId;
    const travelerConfirmed = item.traveler_id === currentUserId;
    const currentIndex = STATUS_CHAIN.indexOf(item.status);
    const nextStatus = currentIndex !== -1 && currentIndex < STATUS_CHAIN.length - 1 ? STATUS_CHAIN[currentIndex + 1] : null;

    const hasRated = ratings.some(r => r.order_id === item.id && r.rater_id === currentUserId);

    let statusOptions: string[] = [];
    if (item.status !== 'declined' && item.status !== 'received') {
      if (nextStatus) {
        if (
          (item.status === 'pending' && !isCreator) ||
          (item.status === 'accepted' && isCreator) ||
          (item.status === 'paid' && travelerConfirmed) ||
          (item.status === 'purchased' && travelerConfirmed) ||
          (item.status === 'intransit' && travelerConfirmed) ||
          (item.status === 'delivered' && (shopperConfirmed || isCreator))
        ) {
          statusOptions.push(nextStatus);
        }
      }
      statusOptions.push('cancel');
    }

    return (
      <View style={styles.card}>
        <View style={styles.statusRow}>
          {item.status === 'received' ? (
            <View style={[styles.checkoutButton, styles.completedButton]}>
              <Text style={[styles.checkoutText, { color: '#fff' }]}>Completed</Text>
            </View>
          ) : (
            <>
              <Text style={styles.statusLabel}>Status: {item.status}</Text>
              {isCreator && item.status === 'accepted' ? (
                <TouchableOpacity style={styles.checkoutButton} onPress={() => handleCheckout(item)}>
                  <Text style={styles.checkoutText}>Checkout</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.checkoutButton, styles.disabledButton]}>
                  <Text style={styles.checkoutText}>{nextStatus || 'Completed'}</Text>
                </View>
              )}
            </>
          )}
        </View>
        {renderStatusBar(item.status)}

        {item.status === 'received' && !hasRated && (
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => {
              setRatingOrder(item);
              setRatingModalVisible(true);
            }}
          >
            <Text style={styles.rateButtonText}>Rate Transaction</Text>
          </TouchableOpacity>
        )}

        {travelerConfirmed && item.status === 'pending' && (
          <View style={styles.travelerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                const chatId = generateChatId(item.id.toString(), currentUserId!, item.user_id);
                router.push({
                  pathname: '/Messages/[chatId]',
                  params: {
                    chatId,
                    receiverId: item.user_id,
                    senderId: currentUserId,
                  },
                });
              }}
            >
              <Text style={styles.actionButtonText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => updateStatus(item, 'accepted')}
            >
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => updateStatus(item, 'declined')}
            >
              <Text style={styles.actionButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.profileRow}>
          {item.avatar && <Image source={{ uri: item.avatar }} style={styles.avatar} />}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.first_name}</Text>
            <Text style={styles.rating}>
              {renderStars(item.rating)} ({item.rating.toFixed(1)})
            </Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          {statusOptions.length > 0 && !(travelerConfirmed && item.status === 'pending') && (
            <TouchableOpacity onPress={() => toggleDropdown(item.id)}>
              <Ionicons name="menu" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        {dropdownsVisible[item.id] && (
          <View style={styles.dropdownMenu}>
            {statusOptions.map(s => (
              <TouchableOpacity key={s} onPress={() => updateStatus(item, s)}>
                <Text style={styles.dropdownItem}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={styles.productNameContainer}>
          <Text style={styles.productName}>{item.item_name}</Text>
          <Text style={styles.quantityText}> (x{item.quantity})</Text>
        </View>
        {item.images.length > 0 && (
          <FlatList
            horizontal
            data={item.images}
            keyExtractor={uri => uri}
            renderItem={({ item: uri }) => <Image source={{ uri }} style={styles.productImage} />}
          />
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Text style={styles.rewardLabel}>Reward: </Text>
          <Text style={styles.price}>R{item.traveler_reward.toFixed(2)}</Text>
        </View>
        <Text style={styles.productDetail}>Price: R{item.price.toFixed(2)}</Text>
        <Text style={styles.productDetail}>VAT (Est.): R{item.vat_estimate.toFixed(2)}</Text>
        <Text style={styles.productDetail}>Platform Fee: R{(item.price * 0.05).toFixed(2)}</Text>
        <Text style={styles.productDetail}>Processing Fee: R{(item.price * 0.05).toFixed(2)}</Text>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>R{item.estimated_total.toFixed(2)}</Text>
        </View>
        <Text style={styles.label}>Store:</Text>
        <Text style={styles.value}>{item.store}</Text>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Deliver to:</Text>
          <Text style={styles.value}>{item.destination}</Text>
          <Text style={styles.label}>From:</Text>
          <Text style={styles.value}>{item.source_country}</Text>
          <Text style={styles.label}>Wait time:</Text>
          <Text style={styles.value}>{item.wait_time}</Text>
          {item.details && (
            <>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.value}>{item.details}</Text>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
      <FlatList
        data={orders}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => renderCard(item)}
        refreshing={loading}
        onRefresh={() => currentUserId && fetchOrders(currentUserId)}
        contentContainerStyle={{ padding: 16 }}
      />
      <RatingModal
        visible={ratingModalVisible}
        onClose={() => setRatingModalVisible(false)}
        onSubmit={handleRatingSubmit}
      />
    </>
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
  completedButton: {
    backgroundColor: 'green',
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
  productNameContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  productName: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  quantityText: {
    color: 'green',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productImage: {
    width: 120,
    height: 90,
    marginRight: 8,
    borderRadius: 8,
  },
  price: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 18,
  },
  rewardLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  productDetail: {
    color: '#ccc',
    marginBottom: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  totalLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  totalAmount: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 18,
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
  travelerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 15,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  acceptButton: {
    backgroundColor: '#0a0',
  },
  declineButton: {
    backgroundColor: '#a00',
  },
  rateButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 16,
    alignItems: 'center',
  },
  rateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MyOrdersPage;
