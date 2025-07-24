import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRouter } from 'expo-router';
import { useTravelerOrderStore } from './store/travelerOrderStore';
import { supabase } from '@/supabaseClient';

type RootStackParamList = {
  ProductLink: undefined;
  DeliveryDetails: undefined;
};

const ProductLinkPage = () => {
  const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();
  const router = useRouter();
  const { setOrderDetails } = useTravelerOrderStore();

  const [productName, setName] = useState('');
  const [store, setStore] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [details, setDetails] = useState('');
  const [withBox, setWithBox] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [shopperName, setShopperName] = useState<string | null>(null);
  const [shopperLoading, setShopperLoading] = useState(true);
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      setShopperLoading(true);
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData.user) {
        setShopperLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userData.user.id)
        .single();

      if (!profileError && profile) {
        setShopperName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
      }
      setShopperLoading(false);
    };

    fetchUserName();
  }, []);

  const handleProceedWithLink = () => {
    if (!linkUrl.trim()) {
      Toast.show({ type: 'error', text1: 'Invalid URL', text2: 'Please paste a valid link.' });
      return;
    }
    router.push({ pathname: "/storePage", params: { url: linkUrl, name: 'External Link' } });
  };

  const pickImage = async () => {
    if (images.length >= 2) {
      Toast.show({ type: 'info', text1: 'Limit reached', text2: 'You can upload a maximum of 2 images.' });
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
      Toast.show({ type: 'error', text1: 'Invalid input', text2: 'Product name is required' });
      return;
    }

    if (!price || isNaN(Number(price))) {
      Toast.show({ type: 'error', text1: 'Invalid input', text2: 'Please enter a valid price' });
      return;
    }

    if (!quantity || isNaN(Number(quantity))) {
      Toast.show({ type: 'error', text1: 'Invalid input', text2: 'Please enter a valid quantity' });
      return;
    }

    setLoading(true);

    setOrderDetails({
      item_name: productName,
      store: store || null,
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
      <View style={styles.linkSection}>
        <Text style={styles.linkTitle}>Can't find a store?</Text>
        <Text style={styles.linkSubtitle}>Please paste the product link or store link here</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          placeholderTextColor="#888"
          value={linkUrl}
          onChangeText={setLinkUrl}
        />
        <TouchableOpacity style={styles.proceedButton} onPress={handleProceedWithLink}>
          <Text style={styles.buttonText}>Proceed</Text>
        </TouchableOpacity>
      </View>

      {shopperLoading ? (
        <ActivityIndicator size="small" color="#000" />
      ) : shopperName ? (
        <Text style={styles.shopperText}>Shopper: {shopperName}</Text>
      ) : null}

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
  linkSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  linkSubtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  proceedButton: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shopperText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
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
