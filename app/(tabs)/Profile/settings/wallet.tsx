import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { supabase } from '../../../../supabaseClient';
import { useFocusEffect, useRouter } from 'expo-router';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  created_at: string;
  description?: string;
}

const WalletScreen: React.FC = () => {
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [cashOutAmount, setCashOutAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch balance
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        if (profileData) {
          setBalance(profileData.wallet_balance);
        }

        // Fetch transactions
        const { data: transactionData, error: transactionError } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (transactionError) throw transactionError;
        if (transactionData) {
          setTransactions(transactionData);
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch wallet data.',
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWalletData();
    }, [])
  );

  const handleCashOut = async () => {
    const amount = parseFloat(cashOutAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to cash out.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        const currentBalance = profileData?.wallet_balance ?? 0;
        if (amount > currentBalance) {
          Alert.alert('Insufficient Funds', 'You do not have enough balance to cash out this amount.');
          return;
        }

        setModalVisible(false);
        router.push({
          pathname: './payment',
          params: { cashOutAmount },
        });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'An error occurred.' });
    }
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
      </View>

      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Your balance</Text>
        <View style={styles.balanceRow}>
          {loading ? (
            <ActivityIndicator size="large" color="#000000" />
          ) : (
            <Text style={styles.balanceAmount}>ZAR {balance !== null ? balance.toFixed(2) : '0.00'}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.cashOutButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.cashOutButtonText}>Cash Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>Transactions</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading && transactions.length === 0 ? (
        <ActivityIndicator style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={transactions}
          contentContainerStyle={styles.container}
          ListHeaderComponent={renderHeader}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isDebit = item.type === 'transfer' || item.type === 'debit';
            const amountColor = isDebit ? '#D93F33' : '#28A745';
            const sign = isDebit ? '-' : '+';
            const descriptionParts = item.description?.split('\n') || [];

            return (
              <View style={styles.receiptItem}>
                <View style={styles.receiptHeader}>
                  <Text style={styles.transactionType}>{item.type}</Text>
                  <Text style={styles.transactionDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                
                <View style={styles.receiptBody}>
                  {descriptionParts.map((part, index) => {
                    const [key, value] = part.split(': ');
                    if (!value) return <Text key={index} style={styles.receiptMainText}>{part}</Text>;

                    const isFee = key.startsWith('Platform Fee');
                    return (
                      <View key={index} style={styles.receiptLine}>
                        <Text style={[styles.receiptText, isFee && styles.feeText]}>{key}:</Text>
                        <Text style={[styles.receiptText, isFee && styles.feeText]}>{value}</Text>
                      </View>
                    );
                  })}
                  <View style={styles.receiptTotal}>
                    <Text style={styles.receiptTotalText}>Amount:</Text>
                    <Text style={[styles.receiptTotalAmount, { color: amountColor }]}>
                      {`${sign} ZAR ${item.amount.toFixed(2)}`}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<View style={styles.emptyComponent}><Text>No transactions yet.</Text></View>}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Cash Out</Text>
            <TextInput
              style={styles.input}
              placeholder="Amount in ZAR"
              keyboardType="numeric"
              value={cashOutAmount}
              onChangeText={setCashOutAmount}
            />
            <TouchableOpacity style={[styles.button, styles.buttonConfirm]} onPress={handleCashOut}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    container: {
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#121212',
    },
    balanceSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    balanceLabel: {
        fontSize: 16,
        color: '#6C757D',
        marginBottom: 8,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    balanceAmount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#121212',
    },
    cashOutButton: {
        backgroundColor: 'green',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    cashOutButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    transactionsSection: {
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#121212',
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    transactionType: {
      fontSize: 16,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    transactionDate: {
      fontSize: 12,
      color: '#6C757D',
    },
    transactionAmount: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    feeText: {
      color: '#D93F33',
      fontWeight: 'bold',
    },
    receiptItem: {
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    receiptHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#E9ECEF',
      paddingBottom: 10,
      marginBottom: 10,
    },
    receiptBody: {
      paddingTop: 5,
    },
    receiptLine: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    receiptText: {
      fontSize: 14,
      color: '#495057',
    },
    receiptMainText: {
      fontSize: 14,
      color: '#495057',
      marginBottom: 10,
    },
    receiptTotal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: '#E9ECEF',
      paddingTop: 10,
      marginTop: 10,
    },
    receiptTotalText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#121212',
    },
    receiptTotalAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#28A745',
    },
    emptyComponent: {
      alignItems: 'center',
      marginTop: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalView: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#F8F9FA',
        borderColor: '#E9ECEF',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    button: {
        borderRadius: 8,
        padding: 15,
        elevation: 2,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonConfirm: {
        backgroundColor: '#000000',
    },
    buttonClose: {
        backgroundColor: '#6C757D',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default WalletScreen;

