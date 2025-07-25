import { supabase } from '@/supabaseClient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

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
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill all required fields.' });
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

        Toast.show({ type: 'success', text1: 'Success', text2: 'Logged in!' });
        router.replace('/(tabs)/Home');
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

        Toast.show({ type: 'success', text1: 'Success', text2: 'Account created successfully!' });
        router.replace('/(tabs)/Home');
      }
    } catch (err: any) {
      console.log('Error:', err); // 🔍 Full error in console
      Toast.show({ type: 'error', text1: 'Error', text2: err.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/authscreenimage.jpg')}
      style={styles.background}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
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

          {isLogin && (
            <TouchableOpacity onPress={() => router.push('/forgot-password')}>
              <Text style={styles.toggleText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slightly darker overlay for better text contrast
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 36,
    color: '#fff',
    marginBottom: 40,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#000',
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
});



















































































