import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/app/providers/authProvider';

interface Payout {
  id: string;
  created_at: string;
  amount: number;
  source: string;
}

const PayoutsHistoryScreen: React.FC = () => {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayoutHistory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('id, created_at, amount, source')
        .eq('user_id', user.id)
        .eq('type', 'transfer')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setPayouts(data || []);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch payout history.',
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPayoutHistory();
    }, [user])
  );

  const renderItem = ({ item }: { item: Payout }) => (
    <View style={styles.transactionItem}>
      <View>
        <Text style={styles.payoutSource}>{item.source.replace('_', ' ')}</Text>
        <Text style={styles.payoutDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.payoutAmount}>
        - ZAR {item.amount.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Payouts History</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#000000" />
        ) : payouts.length === 0 ? (
          <View style={styles.noPayoutsContainer}>
            <Text style={styles.noPayoutsText}>
              You do not have any payouts yet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={payouts}
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
  noPayoutsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  noPayoutsText: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  payoutSource: {
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  payoutDate: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
  },
  payoutAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D93F33',
  },
});

export default PayoutsHistoryScreen;