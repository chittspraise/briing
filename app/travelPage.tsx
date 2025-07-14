import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTravel } from './providers/travelProvider';
import { supabase } from '@/supabaseClient';
import { useNavigation } from 'expo-router';

const TravelBookingPage: React.FC = () => {
  const { setTravel } = useTravel();
  const [tripType, setTripType] = useState<'One way' | 'Round trip'>('One way');
  const [showCalendar, setShowCalendar] = useState<'depart' | 'return' | null>(null);
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [budget, setBudget] = useState('');
  const [travelerName, setTravelerName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const handleDayPress = (day: any) => {
    if (showCalendar === 'depart') {
      setDepartureDate(day.dateString);
    } else if (showCalendar === 'return') {
      setReturnDate(day.dateString);
    }
    setShowCalendar(null);
  };

  const addTrip = async () => {
    if (!from.trim() || !to.trim() || !departureDate || !travelerName.trim()) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    if (tripType === 'Round trip' && !returnDate) {
      Alert.alert('Missing return date', 'Please select a return date for round trip.');
      return;
    }

    setLoading(true);

    const travelInfo = {
      from_country: from.trim(),
      to_country: to.trim(),
      departure_date: departureDate,
      return_date: tripType === 'Round trip' ? returnDate : undefined,
      traveler_name: travelerName.trim(),
      is_available: true,
      notes: `Budget: R${budget}`,
    };

    try {
      const { error } = await supabase.from('travel').insert([travelInfo]);
      if (error) {
        console.error('Insert error:', error);
        Alert.alert('Error', 'Failed to save trip. Please try again.');
        return;
      }

      setTravel(travelInfo);
      Alert.alert('Success', 'Trip saved successfully!');
      navigation.navigate('(tabs)', { screen: 'home' });
    } catch (e) {
      console.error('Unexpected error:', e);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Image Banner */}
      <Image
        source={require('@/assets/images/OIP.jpeg')} // Replace with your own image path
        style={styles.bannerImage}
      />

      <Text style={styles.title}>Add Travel</Text>

      <TextInput
        style={styles.input}
        placeholder="Your Name"
        value={travelerName}
        onChangeText={setTravelerName}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="From"
        value={from}
        onChangeText={setFrom}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="To"
        value={to}
        onChangeText={setTo}
        editable={!loading}
      />

      <View style={styles.tripTypeTabs}>
        {['One way', 'Round trip'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.tripTypeTab, tripType === type && styles.activeTab]}
            onPress={() => setTripType(type as 'One way' | 'Round trip')}
            disabled={loading}
          >
            <Text style={tripType === type ? styles.activeTabText : styles.tabText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={() => !loading && setShowCalendar('depart')}>
        <TextInput
          style={styles.input}
          placeholder="Departure Date"
          value={departureDate}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>

      {tripType === 'Round trip' && (
        <TouchableOpacity onPress={() => !loading && setShowCalendar('return')}>
          <TextInput
            style={styles.input}
            placeholder="Return Date"
            value={returnDate}
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>
      )}

      {showCalendar && (
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            [departureDate]: { selected: true, selectedColor: '#000' },
            ...(tripType === 'Round trip' && returnDate
              ? { [returnDate]: { selected: true, selectedColor: '#555' } }
              : {}),
          }}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Your budget (Rands)"
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={addTrip}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Add Trip'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default TravelBookingPage;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  bannerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    color: '#000',
  },
  button: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tripTypeTabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tripTypeTab: {
    flex: 1,
    padding: 10,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#000',
  },
  tabText: {
    color: '#000',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
