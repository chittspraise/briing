import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const items = [
  { label: 'Profile settings', screen: 'settings/editProfile' },
  { label: 'Account details', screen: 'settings/accountDetails'},
  { label: 'Payout method', screen: 'settings/payment' },
  { label: 'Payouts history', screen: 'settings/payout' },
  { label: 'Wallet', screen: 'settings/wallet' },
  { label: 'Notifications', screen: 'settings/notifications' },
];

const SettingsScreen = () => {
  const navigation = useNavigation();

  const handleNavigation = (screen: string | null) => {
    if (screen) {
      navigation.navigate(screen as never);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.card}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={() => handleNavigation(item.screen)}
          >
            <Text style={styles.itemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#aaa',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemText: {
    color: '#000',
    fontSize: 16,
  },
});

export default SettingsScreen;
