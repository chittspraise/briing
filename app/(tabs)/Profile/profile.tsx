import React, { useState, useEffect } from 'react';
import {

  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { supabase } from '@/supabaseClient';
import { useNavigation } from '@react-navigation/native';

const EditProfile = () => {
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert('Error', 'Unable to get user.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setLocation(data.location || '');
    }
    setLoading(false);
  };

  const updateProfile = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      Alert.alert('Error', 'Unable to get user.');
      return;
    }

    const updates = {
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      location,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    setLoading(false);

    if (error) {
      Alert.alert('Update Failed', error.message);
    } else {
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Edit Profile</Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <TextInput
          style={styles.input}
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={updateProfile}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Profile'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  input: {
    height: 50,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
