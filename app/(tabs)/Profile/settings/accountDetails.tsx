import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

const AccountDetailsScreen: React.FC = () => {
  const router = useRouter();

  const [email, setEmail] = useState('praizechitts@gmail.com');
  const [phoneNumber, setPhoneNumber] = useState('+27 78 985 7143');
  const [isEmailVerified] = useState(true);
  const [isPhoneVerified] = useState(true);

  const handleChangePassword = () => {
    Alert.alert('Password Reset', 'A recovery link has been sent to your email.');
  };

  const handleUpdateEmail = () => {
    Alert.alert('Update Email', `Email updated to: ${email}`);
  };

  const handleUpdatePhoneNumber = () => {
    Alert.alert('Update Phone', `Phone number updated to: ${phoneNumber}`);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => Alert.alert('Account Deleted', 'Your account has been deleted.'),
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account details</Text>
          {/* Spacer for alignment */}
          <View style={{ width: 24 }} />
        </View>

        {/* Change Password */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change password</Text>
          <Text style={styles.sectionDescription}>
            We will send a recovery link to {email}
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* Email Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#888"
            />
            {isEmailVerified && (
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.button} onPress={handleUpdateEmail}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
        </View>

        {/* Phone Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phone number</Text>
          <View style={styles.inputContainer}>
            <View style={styles.countryCodeContainer}>
              <Text style={styles.countryCode}>🇿🇦</Text>
              <Text style={styles.countryCode}>+27</Text>
            </View>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={phoneNumber.replace('+27 ', '')}
              onChangeText={(text) => setPhoneNumber(`+27 ${text}`)}
              keyboardType="phone-pad"
              placeholderTextColor="#888"
            />
            {isPhoneVerified && (
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.button} onPress={handleUpdatePhoneNumber}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
        </View>

        {/* Delete Account */}
        <View style={styles.deleteAccountContainer}>
          <Text style={styles.deleteAccountText}>You can also </Text>
          <TouchableOpacity onPress={handleDeleteAccount}>
            <Text style={styles.deleteAccountLink}>delete your account.</Text>
          </TouchableOpacity>
        </View>
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
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  section: {
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  countryCode: {
    fontSize: 16,
    color: '#000',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  verifiedTag: {
    backgroundColor: '#000',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginLeft: 10,
  },
  verifiedText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 50,
  },
  deleteAccountText: {
    fontSize: 14,
    color: '#333',
  },
  deleteAccountLink: {
    fontSize: 14,
    color: '#000',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});

export default AccountDetailsScreen;
