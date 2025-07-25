import { router } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';

const InviteFriendsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invite Friends</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Gift Icon */}
        <View style={styles.giftIconContainer}>
          <View style={styles.giftBox}>
            <View style={styles.giftTop} />
            <View style={styles.giftBody} />
            <View style={styles.giftRibbon} />
          </View>
        </View>

        {/* Offer Text */}
        <Text style={styles.offerTitle}>Give $10.00, get $10.00</Text>
        <Text style={styles.offerDescription}>
          Earn $10.00 for each friend who shops on us!
        </Text>
        <Text style={styles.offerDescription}>
          They&apos;ll get $10.00 too!
        </Text>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton} onPress={() => Toast.show({ type: 'info', text1: 'Share Link', text2: 'Share functionality would be implemented here.' })}>
          <Text style={styles.shareButtonText}>Share a link</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  backButton: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  giftIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  giftBox: {
    width: 100,
    height: 80,
    backgroundColor: '#000000',
    borderRadius: 8,
    position: 'relative',
  },
  giftTop: {
    position: 'absolute',
    top: -20,
    width: 120,
    height: 30,
    backgroundColor: '#000000',
    borderRadius: 8,
    alignSelf: 'center',
  },
  giftRibbon: {
    position: 'absolute',
    width: 20,
    height: '100%',
    backgroundColor: '#FFFFFF',
    left: '50%',
    marginLeft: -10,
  },
  giftBody: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
    textAlign: 'center',
  },
  offerDescription: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 24,
  },
  shareButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 50,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InviteFriendsScreen;
