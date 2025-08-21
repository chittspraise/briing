import React, { useState, useRef } from 'react';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StorePage = () => {
  const { url, name, travelerId } = useLocalSearchParams<{ url: string, name: string, travelerId?: string }>();
  const [currentUrl, setCurrentUrl] = useState(url);
  const webviewRef = useRef<WebView>(null);

  const scrapingJs = `
    (function() {
      const MIN_IMAGE_SIZE = 200;
      let potentialImages = new Set();

      // Image scraping logic...
      const imageSelectors = [
        '[data-testid*="main-image"]', '[class*="product-image"]', '[id*="main-image"]',
        '#product-image', '.gallery-image', '.product-gallery img', '.carousel-image'
      ];
      imageSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(img => potentialImages.add(img.src));
      });
      Array.from(document.getElementsByTagName('img')).forEach(img => {
        if (img.naturalWidth > MIN_IMAGE_SIZE && img.naturalHeight > MIN_IMAGE_SIZE) {
          potentialImages.add(img.src);
        }
      });
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        potentialImages.add(ogImage.content);
      }
      const images = Array.from(potentialImages).filter(Boolean);

      // Product name scraping
      const productName = document.getElementsByTagName('h1')[0]?.innerText;

      // Price scraping logic
      let price = null;
      const priceSelectors = [
        '[data-testid*="price"]', '[class*="price"]', '[id*="price"]', 
        '.price', '#price', '.product-price', '#product-price'
      ];
      for (const selector of priceSelectors) {
        const priceElement = document.querySelector(selector);
        if (priceElement) {
          const priceText = priceElement.innerText.match(/([0-9.,]+)/);
          if (priceText) {
            price = priceText[0].replace(/,/g, '');
            break;
          }
        }
      }
      
      window.ReactNativeWebView.postMessage(JSON.stringify({ 
        type: 'scrapeResult', 
        data: { images, productName, price } 
      }));
      true;
    })();
  `;

  const handleAddToCart = () => {
    if (webviewRef.current) {
      webviewRef.current.injectJavaScript(scrapingJs);
    }
  };

  const onMessage = (event: any) => {
    const message = JSON.parse(event.nativeEvent.data);
    if (message.type === 'scrapeResult') {
      const { images, productName, price } = message.data;
      router.push({ 
        pathname: "/productlink", 
        params: { 
          url: currentUrl, 
          name,
          images: JSON.stringify(images),
          productName: productName,
          price: price,
          travelerId,
        } 
      });
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ uri: url }}
        style={styles.webview}
        onNavigationStateChange={(navState) => {
          setCurrentUrl(navState.url);
        }}
        onMessage={onMessage}
      />
      <TouchableOpacity style={styles.fab} onPress={handleAddToCart}>
        <Ionicons name="cart" size={24} color="white" />
        <Ionicons name="add" size={12} color="white" style={styles.plusIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#000',
    borderRadius: 28,
    elevation: 8,
  },
  plusIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
});

export default StorePage;
