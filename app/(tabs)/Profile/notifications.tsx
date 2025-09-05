import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useFocusEffect, router } from 'expo-router';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/app/providers/authProvider';

interface Notification {
  id: string;
  created_at: string;
  message: string;
  is_read: boolean;
  order_id?: number;
}

const NotificationsScreen: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, created_at, message, is_read, order_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      console.log('Fetched notifications data:', JSON.stringify(data, null, 2));
      setNotifications(data || []);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch notifications.',
      });
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationsAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error marking notifications as read:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      markNotificationsAsRead();
    }, [user])
  );

  const handleNotificationPress = (order_id?: number) => {
    console.log('Notification pressed. Order ID:', order_id);
    if (order_id) {
      console.log('Navigating to order:', order_id);
      router.push({
        pathname: '/(tabs)/Orders/my_orders',
        params: { order_id: order_id },
      });
    } else {
      console.log('No order_id found for this notification.');
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity onPress={() => handleNotificationPress(item.order_id)}>
      <View style={[styles.notificationItem, !item.is_read && styles.unreadItem]}>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationDate}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#000000" />
        ) : notifications.length === 0 ? (
          <View style={styles.noNotificationsContainer}>
            <Text style={styles.noNotificationsText}>
              You have no notifications yet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  noNotificationsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  noNotificationsText: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  notificationItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadItem: {
    backgroundColor: '#f0f8ff',
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 16,
    color: '#333',
  },
  notificationDate: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 8,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',
    marginLeft: 10,
  },
});

export default NotificationsScreen;
