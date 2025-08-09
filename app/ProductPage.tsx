import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { supabase } from '@/supabaseClient';

const screenWidth = Dimensions.get('window').width;

const PaginationDots = ({
  count,
  activeIndex,
}: {
  count: number;
  activeIndex: number;
}) => (
  <View style={styles.paginationContainer}>
    {Array.from({ length: count }).map((_, index) => (
      <View
        key={index}
        style={[
          styles.dot,
          index === activeIndex ? styles.activeDot : styles.inactiveDot,
        ]}
      />
    ))}
  </View>
);

const ProductPage = () => {
  const params = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  const [activeRelatedIndex, setActiveRelatedIndex] = useState(0);
  const [matchingTraveler, setMatchingTraveler] = useState<any>(null);

  // Effect to set the main product from params
  useEffect(() => {
    const fetchProductDetails = async (orderId: string) => {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching product details:', error);
        setProduct(null);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    if (params.item_name) {
      setProduct(params);
      setLoading(false);
    } else if (params.orderId) {
      fetchProductDetails(params.orderId as string);
    } else {
      setLoading(false);
      setProduct(null);
    }
  }, [params.item_name, params.orderId]);

  // Effect to fetch related items and order count when product changes
  useEffect(() => {
    const fetchOrderCount = async (itemName: string) => {
      if (!itemName) return;
      const { count, error } = await supabase
        .from('product_orders')
        .select('id', { count: 'exact', head: true })
        .eq('item_name', itemName);

      if (error) {
        console.error('Error fetching order count:', error);
      } else {
        setOrderCount(count || 0);
      }
    };

    const fetchRelatedItems = async (store: string, productId: any) => {
      if (!store || !productId) return;
      const { data, error } = await supabase
        .from('product_orders')
        .select('*')
        .eq('store', store)
        .neq('id', productId)
        .limit(5);

      if (error) {
        console.error('Error fetching related items:', error);
      } else {
        setRelatedItems(data || []);
      }
    };

    const findMatchingTraveler = async (sourceCountry: string) => {
      if (!sourceCountry) {
        return;
      }
      // Trim whitespace from the source country
      const trimmedCountry = sourceCountry.trim();

      // Fetch the first matching traveler without using .single()
      const { data, error } = await supabase
        .from('travel')
        .select('*')
        .ilike('from_country', trimmedCountry)
        .limit(1);

      if (error) {
        setMatchingTraveler(null);
      } else if (data && data.length > 0) {
        setMatchingTraveler(data[0]);
      } else {
        setMatchingTraveler(null);
      }
    };

    if (product) {
      fetchOrderCount(product.item_name);
      fetchRelatedItems(product.store, product.id);
      findMatchingTraveler(product.source_country);
    } else {
      setRelatedItems([]);
      setOrderCount(0);
      setMatchingTraveler(null);
    }
  }, [product]);

  const findMatchingTraveler = async (sourceCountry: string) => {
    if (!sourceCountry) return;
    // Search for a traveler whose 'from_country' is an exact case-insensitive match.
    const { data, error } = await supabase
      .from('travel')
      .select('*')
      .ilike('from_country', sourceCountry)
      .limit(1)
      .single();

    if (error) {
      // This is expected if no match is found, so we don't log it as an error.
      setMatchingTraveler(null);
    } else {
      setMatchingTraveler(data);
    }
  };

  const handleRequestItem = () => {
    if (!product) return;
    router.push({
      pathname: '/productlink',
      params: {
        url: product.store,
        name: product.store,
        images: JSON.stringify([product.image_url]),
        productName: product.item_name,
        price: product.price,
      },
    });
  };

  const handleScroll =
    (setIndex: (i: number) => void) =>
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / 150);
      setIndex(index);
    };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Product not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: product.image_url as string }} style={styles.mainImage} />
      <View style={styles.content}>
        <Text style={styles.title}>{product.item_name}</Text>
        <Text style={styles.price}>ZAR{product.price}</Text>
        <Text style={styles.details}>From: {product.source_country}</Text>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/storePage',
              params: { url: product.store, name: product.store },
            })
          }
        >
          <Text style={styles.link}>Buy from: {product.store}</Text>
        </TouchableOpacity>
        <Text style={styles.orderCount}>
          {orderCount} people have ordered this
        </Text>

        {matchingTraveler && (
          <View style={styles.travelerMatchContainer}>
            <Ionicons name="airplane" size={24} color="#2E86DE" />
            <Text style={styles.travelerMatchText}>
              A traveler from {matchingTraveler.from_country} to {matchingTraveler.to_country} is ready to bring this for you!
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.requestButton}
          onPress={handleRequestItem}
        >
          <Text style={styles.requestButtonText}>Request Item</Text>
        </TouchableOpacity>

        

        <View style={styles.section}>
          <View style={styles.featureSection}>
            <Ionicons name="shield-checkmark-outline" size={24} color="green" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Briing Protection</Text>
              <Text style={styles.featureDescription}>
                Briing protects your payment until you confirm you have
                received your order.
              </Text>
            </View>
          </View>
          <View style={styles.featureSection}>
            <MaterialCommunityIcons name="key-variant" size={24} color="#666" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Secure Payments</Text>
              <Text style={styles.featureDescription}>
                Your payment is secured and never released to the traveler
                until you confirm you have received your order.
              </Text>
            </View>
          </View>
          <View style={styles.featureSection}>
            <Feather name="check-circle" size={24} color="green" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>100% Money Back Guarantee</Text>
              <Text style={styles.featureDescription}>
                If your item is not delivered, you will receive a full refund.
              </Text>
            </View>
          </View>
          <View style={styles.featureSection}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color="#666"
            />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>24/7 Customer Care</Text>
              <Text style={styles.featureDescription}>
                Our support team is available to help you with any questions or
                issues.
              </Text>
            </View>
          </View>
        </View>

        {relatedItems && relatedItems.length > 0 && (
          <View style={styles.relatedItemsSection}>
            <Text style={styles.sectionTitle}>Related Items</Text>
            <FlatList
              data={relatedItems}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll(setActiveRelatedIndex)}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.relatedItemCard}
                  onPress={() =>
                    router.push({
                      pathname: '/ProductPage',
                      params: { orderId: item.id },
                    })
                  }
                >
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.relatedItemImage}
                  />
                  <Text style={styles.relatedItemName}>{item.item_name}</Text>
                  <Text style={styles.relatedItemPrice}>ZAR{item.price}</Text>
                </TouchableOpacity>
              )}
            />
            <PaginationDots
              count={relatedItems.length}
              activeIndex={activeRelatedIndex}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mainImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    backgroundColor: '#1a1a1a',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f0',
    marginBottom: 10,
  },
  details: {
    fontSize: 16,
    marginBottom: 5,
    color: '#ccc',
  },
  link: {
    fontSize: 16,
    color: '#007bff',
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  orderCount: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  travelerMatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  travelerMatchText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  requestButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  requestButtonText: {
    textAlign: 'center',
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  paymentLogos: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  paymentLogo: {
    width: 50,
    height: 30,
    resizeMode: 'contain',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  featureSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureText: {
    marginLeft: 15,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  featureDescription: {
    fontSize: 14,
    color: '#ccc',
  },
  relatedItemsSection: {
    marginTop: 20,
  },
  relatedItemCard: {
    marginRight: 15,
    width: 150,
  },
  relatedItemImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    resizeMode: 'contain',
  },
  relatedItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#fff',
  },
  relatedItemPrice: {
    fontSize: 14,
    color: '#0f0',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  inactiveDot: {
    backgroundColor: '#777',
  },
});

export default ProductPage;
