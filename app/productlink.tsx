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
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTravelerOrderStore } from './store/travelerOrderStore';
import { supabase } from '@/supabaseClient';

type RootStackParamList = {
  ProductLink: undefined;
  productSummary: undefined;
};

const ProductLinkPage = () => {
  const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();

  const params = useLocalSearchParams();
  const travelerIdFromParams = params.travelerId as string | undefined;
  const url = params.url as string;
  const name = params.name as string;
  const images = JSON.parse(params.images as string || '[]');
  const productNameFromParams = params.productName as string;
  const priceFromParams = params.price as string;
  const orderId = params.orderId as string | undefined;

  const { setOrderDetails } = useTravelerOrderStore();

  useEffect(() => {
    if (travelerIdFromParams) {
      useTravelerOrderStore.setState({ travelerId: travelerIdFromParams });
    }
  }, [travelerIdFromParams]);

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        const { data, error } = await supabase
          .from('product_orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (data) {
          setProductName(data.item_name);
          setProductLink(data.store_url);
          setPrice(data.price.toString());
          setQuantity(data.quantity.toString());
          setDescription(data.details);
          setImageUris(data.image_url ? [data.image_url] : []);
          setSelectedImage(data.image_url);
          setIsGift(!data.with_box);
        }
      };
      fetchOrder();
    }
  }, [orderId]);


  // Form state
  const [productLink, setProductLink] = useState(url);
  const [price, setPrice] = useState(priceFromParams);
  const [quantity, setQuantity] = useState('');
  const [imageUris, setImageUris] = useState<string[]>(images);
  const [selectedImage, setSelectedImage] = useState<string | null>(images.length > 0 ? images[0] : null);
  const [isGift, setIsGift] = useState(false);
  const [productName, setProductName] = useState(productNameFromParams);
  const [description, setDescription] = useState('');


  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newUri = result.assets[0].uri;
      setImageUris(prev => [...prev, newUri]);
      if (!selectedImage) {
        setSelectedImage(newUri);
      }
    }
  };

  const handleNext = () => {
    setOrderDetails({
      item_name: productName,
      store: name,
      price: price,
      quantity: quantity,
      image_url: selectedImage,
      with_box: !isGift,
      details: description,
      store_url: productLink,
    });
    router.push({ pathname: '/DeliveryDetails', params: { orderId: orderId } });
  };

  const openInStore = () => {
    router.push({ pathname: "/storePage", params: { url: productLink, name } });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
       <Text style={styles.label}>Product Name</Text>
      <TextInput
        style={styles.input}
        value={productName}
        onChangeText={setProductName}
        placeholder="Enter product name"
        placeholderTextColor="#999"
      />
      <Text style={styles.label}>Product URL</Text>
      <TouchableOpacity onPress={openInStore}>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={productLink}
          editable={false}
        />
      </TouchableOpacity>

      <Text style={styles.label}>Price on {name}</Text>
      <View style={styles.priceInputContainer}>
        <Text style={styles.currencySymbol}>ZAR</Text>
        <TextInput
          style={styles.priceInput}
          value={price}
          onChangeText={setPrice}
          placeholder="Enter price"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.label}>Quantity</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Enter quantity"
        placeholderTextColor="#999"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Product Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter product description"
        placeholderTextColor="#999"
        multiline
      />

      <Text style={styles.label}>Product Image</Text>
      {selectedImage && <Image source={{ uri: selectedImage }} style={styles.mainImage} />}
      
      <FlatList
        data={imageUris}
        horizontal
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedImage(item)}>
            <Image 
              source={{ uri: item }} 
              style={[
                styles.thumbnail,
                selectedImage === item && styles.selectedThumbnail
              ]} 
            />
          </TouchableOpacity>
        )}
        style={styles.thumbnailList}
      />

      <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
        <Text style={styles.imagePickerText}>Add Your Own Image</Text>
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
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 8,
  },
  currencySymbol: {
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#000',
  },
  priceInput: {
    flex: 1,
    padding: 12,
    color: '#000',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  mainImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  thumbnailList: {
    marginTop: 10,
    marginBottom: 10,
    maxHeight: 100,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#007bff',
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
