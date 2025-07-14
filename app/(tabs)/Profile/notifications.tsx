import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const NotificationsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notifications</Text>

      <Text style={styles.readAll}>Read All</Text>

      <View style={styles.notificationCard}>
        <View style={styles.iconPlaceholder} />
        <View style={{ flex: 1 }}>
          <Text style={styles.notificationText}>
            Your order <Text style={styles.bold}>PLAYSTATION 5 SLIM + PS5 MEDIA REMOTE + MARVEL&#39;S SPIDERMAN 2 (PS5)</Text> has expired. You can renew it anytime.
          </Text>
          <Text style={styles.date}>July 1, 2025</Text>
        </View>
        <View style={styles.dot} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  readAll: {
    color: '#007aff',
    fontSize: 14,
    marginBottom: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#ddd',
    borderRadius: 20,
    marginRight: 10,
  },
  notificationText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  bold: {
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    marginLeft: 8,
    marginTop: 6,
  },
});

export default NotificationsScreen;
