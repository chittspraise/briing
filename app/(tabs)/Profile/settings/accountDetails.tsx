import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/supabaseClient';

const AccountDetailsScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        Alert.alert('Error', 'Could not fetch user.');
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? '');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single();

      if (!profileError && profile) {
        setPhoneNumber(profile.phone || '');
        setIsPhoneVerified(true); // update based on logic if needed
        setIsEmailVerified(true); // update based on logic if needed
      }
    })();
  }, []);

  const handleChangePassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Password Reset', 'A recovery link has been sent to your email.');
    }
  };

  const handleUpdateEmail = async () => {
    if (!userId) return;

    const { error: updateAuthError } = await supabase.auth.updateUser({ email });

    if (updateAuthError) {
      Alert.alert('Error', updateAuthError.message);
      return;
    }

    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ email })
      .eq('id', userId);

    if (updateProfileError) {
      Alert.alert('Error', updateProfileError.message);
    } else {
      Alert.alert('Success', 'Email updated.');
    }
  };

  const handleUpdatePhoneNumber = async () => {
    if (!userId) return;

    const { error } = await supabase
      .from('profiles')
      .update({ phone: phoneNumber })
      .eq('id', userId);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Phone number updated.');
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!userId) return;

            // Delete from profiles first
            const { error: profileError } = await supabase
              .from('profiles')
              .delete()
              .eq('id', userId);

            // Delete from auth (requires elevated API access)
            const { error: authError } = await supabase.auth.admin.deleteUser(userId);

            if (profileError || authError) {
              Alert.alert('Error', profileError?.message || authError?.message);
            } else {
              Alert.alert('Account Deleted', 'Your account has been deleted.');
              router.replace('/'); // go to main screen
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* You can optionally add a small title here inside the content */}
        {/* <Text style={styles.pageTitle}>Account details</Text> */}

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
