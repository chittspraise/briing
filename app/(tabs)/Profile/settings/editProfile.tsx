import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/supabaseClient';

const EditProfileScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Photo access is required.');
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        Alert.alert('Error', 'Failed to get user');
        return;
      }

      setUserId(user.id);

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, image_url')
        .eq('id', user.id)
        .single();

      if (!profileError && data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setImage(data.image_url || null);
      }
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;

      try {
        setUploading(true);
        const fileName = `${userId}-${Date.now()}.jpg`;
        const filePath = `profiles/${fileName}`;

        const response = await fetch(uri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, blob, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          Alert.alert('Upload Error', uploadError.message);
          setUploading(false);
          return;
        }

        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        setImage(data.publicUrl);

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ image_url: data.publicUrl })
          .eq('id', userId);

        if (updateError) {
          Alert.alert('Update Failed', updateError.message);
        } else {
          Alert.alert('Image updated successfully');
        }
      } catch (error: any) {
        Alert.alert('Upload Error', error.message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    setUploading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ first_name: firstName, last_name: lastName })
      .eq('id', userId);

    setUploading(false);

    if (error) {
      Alert.alert('Save Failed', error.message);
    } else {
      Alert.alert('Profile updated');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <Text style={styles.sectionLabel}>Profile Picture</Text>
      <View style={styles.avatarContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar} />
        )}
      </View>

      <TouchableOpacity
        style={[styles.uploadButton, uploading && { opacity: 0.6 }]}
        onPress={pickImage}
        disabled={uploading}
      >
        <Text style={styles.uploadText}>{uploading ? 'Uploading...' : 'Update Photo'}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>First Name</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First name"
        placeholderTextColor="#888"
        editable={!uploading}
      />

      <Text style={styles.sectionLabel}>Last Name</Text>
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Last name"
        placeholderTextColor="#888"
        editable={!uploading}
      />

      <TouchableOpacity
        style={[styles.saveButton, uploading && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={uploading}
      >
        <Text style={styles.saveText}>{uploading ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '600', color: '#000', textAlign: 'center', marginBottom: 20 },
  sectionLabel: { fontWeight: '600', fontSize: 14, color: '#000', marginVertical: 10 },
  avatarContainer: { alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#000',
  },
  uploadButton: {
    alignSelf: 'center',
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 6,
    marginBottom: 20,
  },
  uploadText: { color: '#fff', fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 20,
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
