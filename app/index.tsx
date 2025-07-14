import { supabase } from '@/supabaseClient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);

    if (!email || !password || (!isLogin && (!firstName || !lastName || !phone))) {
      Alert.alert('Missing Fields', 'Please fill all required fields.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;

        Alert.alert('Success', 'Logged in!');
        router.push('/Home');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) throw error;

        const userId = data?.user?.id;
        if (!userId) throw new Error('User ID not returned');

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email.trim().toLowerCase(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone: phone.trim(),
          });

        if (profileError) throw profileError;

        Alert.alert('Success', 'Account created successfully!');
        router.push('/Home');
      }
    } catch (err: any) {
      console.log('Error:', err); // 🔍 Full error in console
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>

      {!isLogin && (
        <>
          <TextInput
            placeholder="First Name"
            placeholderTextColor="#999"
            style={styles.input}
            onChangeText={setFirstName}
            value={firstName}
          />
          <TextInput
            placeholder="Last Name"
            placeholderTextColor="#999"
            style={styles.input}
            onChangeText={setLastName}
            value={lastName}
          />
          <TextInput
            placeholder="Phone"
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="phone-pad"
            onChangeText={setPhone}
            value={phone}
          />
        </>
      )}

      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#999"
        style={styles.input}
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.toggleText}>
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;

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
  toggleText: {
    color: '#fff',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});



















































































