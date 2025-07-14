import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useOrder } from './providers/orderProvider';

type RootStackParamList = {
  ProductLink: undefined;
  DeliveryDetails: undefined;
};

const ProductLinkPage = () => {
  const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();
  const orderContext = useOrder();

  if (!orderContext) {
    throw new Error('OrderProvider is missing in the component tree.');
  }

  const { setOrder } = orderContext;

  const [productName, setName] = useState('');
  const [store, setStore] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [details, setDetails] = useState('');
  const [withBox, setWithBox] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (images.length >= 2) {
      Alert.alert('Limit reached', 'You can upload a maximum of 2 images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const newImageUri = result.assets[0].uri;
      setImages([...images, newImageUri]);
    }
  };

  const proceedToDeliveryDetails = async () => {
    if (!productName.trim()) {
      Alert.alert('Invalid input', 'Product name is required');
      return;
    }

    if (!price || isNaN(Number(price))) {
      Alert.alert('Invalid input', 'Please enter a valid price');
      return;
    }

    if (!quantity || isNaN(Number(quantity))) {
      Alert.alert('Invalid input', 'Please enter a valid quantity');
      return;
    }

    setLoading(true);

    setOrder({
      item_name: productName,
      store: store || null, // store is optional
      price,
      quantity,
      details,
      with_box: withBox,
      image_url: images.join(','),
    });

    setLoading(false);
    navigation.navigate('DeliveryDetails');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Product name</Text>
      <TextInput
        style={styles.input}
        value={productName}
        onChangeText={setName}
        placeholder="Enter product name"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Store (optional)</Text>
      <TextInput
        style={styles.input}
        value={store}
        onChangeText={setStore}
        placeholder="Enter store name or link"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Product images (optional)</Text>
      <View style={styles.imageRow}>
        {images.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.imageThumb} />
        ))}
        {images.length < 2 && (
          <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
            <Text style={styles.plus}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        placeholder="$0.00"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <Text style={styles.label}>Quantity</Text>
      <TextInput
        style={styles.input}
        placeholder="1"
        keyboardType="numeric"
        placeholderTextColor="#888"
        value={quantity}
        onChangeText={setQuantity}
      />

      <Text style={styles.label}>Product details</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        numberOfLines={4}
        placeholder="Provide more details (e.g., size, color)..."
        placeholderTextColor="#888"
        value={details}
        onChangeText={setDetails}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>With box</Text>
        <Switch
          value={withBox}
          onValueChange={setWithBox}
          thumbColor={withBox ? '#000' : '#ccc'}
        />
      </View>
      <Text style={styles.subText}>
        Requiring the box may reduce offers. Travelers prefer saving space.
      </Text>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={proceedToDeliveryDetails}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Processing...' : 'Next'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProductLinkPage;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
  },
  subText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    color: '#000',
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  uploadBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  plus: {
    fontSize: 32,
    color: '#000',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
