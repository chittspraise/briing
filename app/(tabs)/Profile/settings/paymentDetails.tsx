import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/app/providers/authProvider';

const PaymentDetailsScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { payoutOption, cashOutAmount } = useLocalSearchParams<{ payoutOption: 'fnb_account' | 'other_sa_bank_account', cashOutAmount: string }>();

  const isFNB = payoutOption === 'fnb_account';
  const amountToCashOut = parseFloat(cashOutAmount);

  const [bankName, setBankName] = useState(isFNB ? 'First National Bank' : '');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branchCode, setBranchCode] = useState(isFNB ? '250655' : '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!user) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('user_payment_details')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && data.payout_option === payoutOption) {
        setBankName(data.bank_name);
        setAccountHolder(data.account_holder_name);
        setAccountNumber(data.account_number);
        setBranchCode(data.branch_code);
      } else if (error && error.code !== 'PGRST116') {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch payment details.' });
      }
      setLoading(false);
    };

    fetchPaymentDetails();
  }, [user, payoutOption]);

  const handleConfirmPayout = async () => {
    if (!user) {
      Toast.show({ type: 'error', text1: 'Authentication Error', text2: 'You must be logged in.' });
      return;
    }
    if (!accountHolder || !accountNumber || !branchCode || !bankName) {
      Toast.show({ type: 'error', text1: 'Missing Information', text2: 'Please fill in all required fields.' });
      return;
    }

    setLoading(true);
    try {
      // 1. Save payment details (upsert)
      const { error: saveError } = await supabase.from('user_payment_details').upsert({
        user_id: user.id,
        payout_option: payoutOption,
        bank_name: bankName,
        account_holder_name: accountHolder,
        account_number: accountNumber,
        branch_code: branchCode,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id, payout_option' });

      if (saveError) throw saveError;

      // 2. Process payout
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const currentBalance = profileData?.wallet_balance ?? 0;
      if (isNaN(amountToCashOut) || amountToCashOut <= 0) {
        Alert.alert('Invalid Amount', 'The cash out amount must be positive.');
        setLoading(false);
        return;
      }
      if (amountToCashOut > currentBalance) {
        Alert.alert('Insufficient Funds', 'You do not have enough balance to cash out this amount.');
        setLoading(false);
        return;
      }

      const newBalance = currentBalance - amountToCashOut;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', user.id);

      if (updateError) throw updateError;

      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert([{ user_id: user.id, amount: amountToCashOut, type: 'transfer', source: payoutOption }]);

      if (transactionError) throw transactionError;

      // Add notification for the user who initiated the payout
      const { error: notificationError } = await supabase.from('notifications').insert({
        user_id: user.id,
        message: `Your payout of ZAR ${amountToCashOut.toFixed(2)} has been processed successfully.`,
      });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      Alert.alert('Success', `Successfully cashed out ZAR ${amountToCashOut.toFixed(2)}.`, [
        { text: 'OK', onPress: () => router.push('/(tabs)/Profile/settings/wallet') },
      ]);

    } catch (error) {
      Toast.show({ type: 'error', text1: 'Payout Error', text2: 'Failed to complete the payout.' });
      console.error('Payout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}><Text>Loading...</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
       <Image
          source={isFNB ? require('@/assets/images/accntfnb.jpg') : require('@/assets/images/manycards.jpg')}
          style={styles.bannerImage}
        />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>
          {isFNB ? 'FNB Account Details' : 'SA Bank Account Details'}
        </Text>
        <Text style={styles.headerSubtitle}>
          Confirm your bank details for a payout of <Text style={{fontWeight: 'bold'}}>ZAR {amountToCashOut.toFixed(2)}</Text>.
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bank Name</Text>
            <TextInput
              style={[styles.input, isFNB ? styles.disabledInput : styles.editableInput]}
              value={bankName}
              onChangeText={setBankName}
              placeholder="Enter Bank Name"
              editable={!isFNB}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Holder Name</Text>
            <TextInput
              style={styles.input}
              value={accountHolder}
              onChangeText={setAccountHolder}
              placeholder="e.g., John Doe"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="Your bank account number"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Branch Code</Text>
            <TextInput
              style={styles.input}
              value={branchCode}
              onChangeText={setBranchCode}
              placeholder="e.g., 250655"
              keyboardType="numeric"
              maxLength={6}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleConfirmPayout}>
          <Text style={styles.submitButtonText}>Confirm Payout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: 20,
  },
  bannerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  editableInput: {
    backgroundColor: '#f5f5f5',
  },
  disabledInput: {
    backgroundColor: '#e9ecef',
    color: '#6c757d',
  },
  submitButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PaymentDetailsScreen;
