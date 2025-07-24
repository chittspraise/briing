import { supabase } from '@/supabaseClient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const ResetPasswordScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const { access_token } = useLocalSearchParams<{ access_token?: string }>();

  useEffect(() => {
    if (access_token) {
      setToken(access_token);
    }
  }, [access_token]);

  const handleReset = async () => {
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Passwords do not match.' });
      return;
    }
    if (!password) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Password cannot be empty.' });
      return;
    }
    if (!token) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Invalid or missing reset token.' });
      return;
    }

    setLoading(true);

    try {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: '', // Refresh token is not available in the reset link
      });

      if (sessionError) throw sessionError;

      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) throw updateError;

      await supabase.auth.signOut();

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Your password has been reset successfully!',
      });
      router.push('/must-be-signed-in');

    } catch (err: any) {
      console.error('Password reset failed:', err);
      Toast.show({ type: 'error', text1: 'Error', text2: err.message || 'Failed to reset password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        placeholder="New Password"
        placeholderTextColor="#999"
        style={styles.input}
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <TextInput
        placeholder="Confirm New Password"
        placeholderTextColor="#999"
        style={styles.input}
        secureTextEntry
        onChangeText={setConfirmPassword}
        value={confirmPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#000',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});