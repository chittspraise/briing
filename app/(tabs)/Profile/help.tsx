import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const ContentNotFoundScreen: React.FC = () => {
  const handleOpenInBrowser = () => {
    Alert.alert('Open in Browser', 'This would open the content in a web browser.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Content not found</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.groundCircle} />
          <View style={styles.personBody} />
          <View style={styles.personHead} />
          <View style={styles.personArmLeft} />
          <View style={styles.personArmRight} />
          <View style={styles.personLegs} />
          <View style={styles.phone} />
          <View style={styles.plant1} />
          <View style={styles.plant2} />
          <View style={styles.plant3} />
        </View>

        {/* Message */}
        <Text style={styles.messageTitle}>Content not found</Text>
        <Text style={styles.messageDescription}>
          It seems like the content you are looking for is
        </Text>
        <Text style={styles.messageDescription}>
          not available in the app. Please proceed to the
        </Text>
        <Text style={styles.messageDescription}>browser.</Text>

        {/* Open in Browser Button */}
        <TouchableOpacity onPress={() => Toast.show({ type: 'info', text1: 'Open in Browser', text2: 'This would open the content in a web browser.' })}>
          <Text style={styles.openBrowserButtonText}>Open in browser</Text>
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
  illustrationContainer: {
    width: 200,
    height: 200,
    position: 'relative',
    marginBottom: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groundCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#F5F5F5',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -90,
  },
  personBody: {
    width: 40,
    height: 60,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 70,
    left: '50%',
    marginLeft: -20,
    borderRadius: 5,
  },
  personHead: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 130,
    left: '50%',
    marginLeft: -15,
  },
  personArmLeft: {
    width: 10,
    height: 40,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 90,
    left: '50%',
    marginLeft: -30,
    transform: [{ rotate: '-20deg' }],
    borderRadius: 5,
  },
  personArmRight: {
    width: 10,
    height: 40,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 90,
    left: '50%',
    marginLeft: 20,
    transform: [{ rotate: '20deg' }],
    borderRadius: 5,
  },
  personLegs: {
    width: 30,
    height: 50,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: 20,
    left: '50%',
    marginLeft: -15,
    borderRadius: 5,
  },
  phone: {
    width: 15,
    height: 25,
    backgroundColor: '#333333',
    borderRadius: 3,
    position: 'absolute',
    bottom: 100,
    left: '50%',
    marginLeft: -5,
    transform: [{ rotate: '10deg' }],
  },
  plant1: {
    width: 20,
    height: 40,
    backgroundColor: '#000000',
    borderRadius: 10,
    position: 'absolute',
    bottom: 40,
    left: 40,
    transform: [{ rotate: '15deg' }],
  },
  plant2: {
    width: 25,
    height: 50,
    backgroundColor: '#000000',
    borderRadius: 12,
    position: 'absolute',
    bottom: 30,
    right: 40,
    transform: [{ rotate: '-10deg' }],
  },
  plant3: {
    width: 15,
    height: 30,
    backgroundColor: '#000000',
    borderRadius: 8,
    position: 'absolute',
    bottom: 50,
    left: 70,
    transform: [{ rotate: '5deg' }],
  },
  messageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
    textAlign: 'center',
  },
  messageDescription: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 24,
  },
  openBrowserButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 50,
  },
  openBrowserButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ContentNotFoundScreen;
