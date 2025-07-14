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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

type RootStackParamList = {
  ProductLink: undefined;
  DeliveryDetails: undefined;
};

const ProductLinkPage = () => {
  const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();
  const [link, setLink] = useState('');
  const [productName] = useState('EA SPORTS FC 25 Standard Edition PS5 | EU Version Region Free');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [details, setDetails] = useState('');
  const [withBox, setWithBox] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Product link</Text>
      <TextInput
        style={styles.input}
        placeholder="Paste product link"
        placeholderTextColor="#888"
        value={link}
        onChangeText={setLink}
      />

      <Text style={styles.label}>Product name</Text>
      <TextInput
        style={styles.input}
        editable={false}
        value={productName}
      />

      <Text style={styles.label}>Product image</Text>
      <View style={styles.imageRow}>
        {image && (
          <Image source={{ uri: image }} style={styles.imageThumb} />
        )}
        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
          <Text style={styles.uploadText}>Upload image</Text>
        </TouchableOpacity>
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

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DeliveryDetails' )}>
        <Text style={styles.buttonText}>Next</Text>
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
  },
  uploadText: {
    fontSize: 12,
    color: '#000',
    textAlign: 'center',
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
