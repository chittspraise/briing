import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const PayoutMethodScreen: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState('South Africa');
  const [selectedPayoutOption, setSelectedPayoutOption] = useState<'fnb_account' | 'other_sa_bank_account' | null>(null);

  const handleContinue = () => {
    if (!selectedPayoutOption) {
      Alert.alert('Selection Required', 'Please select a payout method to continue.');
      return;
    }
    Alert.alert(
      'Continue',
      `Selected Payout Method: ${
        selectedPayoutOption === 'fnb_account' ? 'FNB Account' : 'Other South African Bank Account'
      }`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Removed manual header and back button */}

        {/* Country Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your country</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCountry}
              onValueChange={(itemValue) => setSelectedCountry(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="South Africa" value="South Africa" />
              <Picker.Item label="United States" value="United States" />
              {/* Add more countries as needed */}
            </Picker>
          </View>
          <Text style={styles.sectionDescription}>
            Select your country of residence or citizenship.
          </Text>
        </View>

        {/* Payout Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>You can get paid with:</Text>

          {/* FNB Account */}
          <TouchableOpacity
            style={styles.optionContainer}
            onPress={() => setSelectedPayoutOption('fnb_account')}
          >
            <View style={styles.radioButton}>
              {selectedPayoutOption === 'fnb_account' && <View style={styles.radioButtonInner} />}
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>
                FNB Account <Text style={styles.tag}>RECOMMENDED</Text>
              </Text>
              <Text style={styles.optionDescription}>
                Receive payouts directly to your First National Bank account in ZAR.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Other Bank */}
          <TouchableOpacity
            style={styles.optionContainer}
            onPress={() => setSelectedPayoutOption('other_sa_bank_account')}
          >
            <View style={styles.radioButton}>
              {selectedPayoutOption === 'other_sa_bank_account' && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Other South African Bank Account</Text>
              <Text style={styles.optionDescription}>
                Get paid within 3-15 business days to any South African bank.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <Text style={styles.footerText}>
          Please set up a payout method to receive payments on time.
        </Text>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
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
    paddingBottom: 40,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#444',
    marginTop: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#000',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    marginTop: 4,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  tag: {
    fontSize: 10,
    color: '#fff',
    backgroundColor: '#000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 5,
    overflow: 'hidden',
  },
  optionDescription: {
    fontSize: 13,
    color: '#333',
  },
  footerText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginTop: 10,
  },
  continueButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 15,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PayoutMethodScreen;
