import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/supabaseClient';
import { useAuth } from '@/app/providers/authProvider';

const BankDetailsScreen: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { payout_option } = useLocalSearchParams<{ payout_option: string }>();

  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveDetails = async () => {
    if (payout_option !== 'bank_transfer') {
      Toast.show({
        type: 'error',
        text1: 'Invalid Payout Option',
        text2: 'The selected payout option is not valid for bank details.',
      });
      return;
    }
    if (!accountHolderName || !accountNumber || !branchCode) {
      Toast.show({ type: 'error', text1: 'All fields are required' });
      return;
    }
    if (!user) {
      Toast.show({ type: 'error', text1: 'Authentication Error', text2: 'You must be logged in.' });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('bank_details')
        .upsert(
          {
            user_id: user.id,
            account_holder_name: accountHolderName,
            account_number: accountNumber,
            branch_code: branchCode,
            payout_option: payout_option,
          },
          { onConflict: 'user_id' }
        )
        .select();

      if (error) throw error;

      Toast.show({ type: 'success', text1: 'Success', text2: 'Bank details saved successfully!' });
      router.back();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: `Failed to save details: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Enter Your Bank Details</Text>

        <TextInput
          style={styles.input}
          placeholder="Account Holder Name"
          value={accountHolderName}
          onChangeText={setAccountHolderName}
        />
        <TextInput
          style={styles.input}
          placeholder="Account Number"
          value={accountNumber}
          onChangeText={setAccountNumber}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Branch Code"
          value={branchCode}
          onChangeText={setBranchCode}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveDetails} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Details</Text>
          )}
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BankDetailsScreen;
