import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { categorizedStores } from '../constants/allStores';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const AllStoresScreen: React.FC = () => {
  const openStore = (url: string, name: string) => {
    router.push({ pathname: "/storePage", params: { url, name } });
  };

  const renderStoreCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => openStore(item.link, item.name)}
    >
      <View style={styles.logoContainer}>
        <Image source={{ uri: item.logo }} style={styles.storeLogo} />
      </View>
      <Text style={styles.storeName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Popular Stores</Text>
      </View>
      <ScrollView style={styles.container}>
        {Object.entries(categorizedStores).map(([category, stores]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <FlatList
              data={stores}
              renderItem={renderStoreCard}
              keyExtractor={(item) => item.name}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storeList}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  categorySection: {
    marginVertical: 15,
  },
  categoryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 10,
  },
  storeList: {
    paddingLeft: 15,
    paddingRight: 5,
  },
  storeCard: {
    width: 120,
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: '#1C1C1E',
    borderRadius: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  storeLogo: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  storeName: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default AllStoresScreen;
