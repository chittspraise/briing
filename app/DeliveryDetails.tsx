import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useOrder } from './providers/orderProvider'; // Adjust the path as needed

const DeliveryDetailsPage = () => {
  const navigation = useNavigation<any>();
  const orderContext = useOrder();
  if (!orderContext) {
    throw new Error('OrderProvider is missing in the component tree.');
  }
  const { order, setOrder } = orderContext;

  const [deliverFrom, setDeliverFrom] = useState(order.deliver_from || 'United States of America');
  const [deliverTo, setDeliverTo] = useState(order.destination || 'Midrand');
  const [waitTime, setWaitTime] = useState(order.wait_time || 'Up to 1 month');
  const [loading, setLoading] = useState(false);

  const waitOptions = [
    '1 day', '2 days', '3 days', '1 week', '2 weeks', '3 weeks', 'Up to 1 month',
  ];

  const proceedToSummary = async () => {
    try {
      setLoading(true);
      setOrder({
        ...order,
        deliver_from: deliverFrom,
        destination: deliverTo,
        wait_time: waitTime,
      });
      setLoading(false);
      navigation.navigate('productSummary');
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Could not save delivery details.');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Delivery details</Text>

      <Text style={styles.label}>Deliver from</Text>
      <TextInput style={styles.input} value={deliverFrom} onChangeText={setDeliverFrom} />

      <Text style={styles.label}>Deliver to</Text>
      <TextInput style={styles.input} value={deliverTo} onChangeText={setDeliverTo} />

      <Text style={styles.info}>
        A traveler going to your city will deliver your order. Enter the country your order is coming from and which city you want it to be delivered to.
      </Text>

      <Text style={styles.label}>How long are you willing to wait?</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={waitTime} onValueChange={setWaitTime} style={styles.picker}>
          {waitOptions.map((option) => (
            <Picker.Item key={option} label={option} value={option} />
          ))}
        </Picker>
      </View>

      <Text style={styles.subText}>
        The longer period you are ready to wait, the more offers you receive and can choose from.
      </Text>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={proceedToSummary}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Next'}</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Do you have an FNB card?</Text>
        <Text style={styles.cardText}>
          You can open one with FNB and pay directly in South African rands. Available nationwide.
        </Text>
        <Image
          source={{
            uri: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/FNB_Logo.png',
          }}
          style={styles.cardImage}
        />
      </View>
    </ScrollView>
  );
};

export default DeliveryDetailsPage;

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  heading: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 20 },
  label: { fontSize: 15, fontWeight: 'bold', color: '#000', marginTop: 20, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 12,
    color: '#000',
  },
  info: { fontSize: 13, color: '#444', marginTop: 10, marginBottom: 20 },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  picker: { height: 50, color: '#000' },
  subText: { fontSize: 12, color: '#444', marginBottom: 30 },
  button: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  cardText: { fontSize: 13, color: '#ccc', textAlign: 'center', marginBottom: 12 },
  cardImage: { width: 60, height: 40, resizeMode: 'contain' },
});
