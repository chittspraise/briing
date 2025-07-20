import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Image,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { useTravelerOrderStore } from './store/travelerOrderStore';

type RootStackParamList = {
  ProductLink: undefined;
  DeliveryDetails: undefined;
};

const ProductLinkPage = () => {
  const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();

  const params = useLocalSearchParams();
  const travelerIdFromParams = params.travelerId as string | undefined;

  const setTravelerId = useTravelerOrderStore((state) => state.setTravelerId);

  useEffect(() => {
    if (travelerIdFromParams) {
      setTravelerId(travelerIdFromParams);
    }
  }, [travelerIdFromParams, setTravelerId]);

  // Form state
  const [productLink, setProductLink] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isGift, setIsGift] = useState(false);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    navigation.navigate('DeliveryDetails' as never);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Paste Product Link</Text>
      <TextInput
        style={styles.input}
        value={productLink}
        onChangeText={setProductLink}
        placeholder="https://example.com/product"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Estimated Price</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Enter price"
        placeholderTextColor="#999"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Quantity</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Enter quantity"
        placeholderTextColor="#999"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Upload Product Image</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.imagePickerText}>Choose Image</Text>
        )}
      </TouchableOpacity>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Mark as Gift</Text>
        <Switch
          value={isGift}
          onValueChange={(value) => setIsGift(value)}
          trackColor={{ false: '#ccc', true: '#000' }}
          thumbColor={isGift ? '#fff' : '#f4f3f4'}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProductLinkPage;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    color: '#000',
  },
  imagePicker: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerText: {
    color: '#000',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 30,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
