import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

const NotificationsScreen: React.FC = () => {
  const router = useRouter();

  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);
  const [salesPromotions, setSalesPromotions] = useState(false);

  const handleToggle = (type: string, value: boolean) => {
    alert(`${type} notifications ${value ? 'enabled' : 'disabled'}`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backButton}>{'< Back'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Notification Settings</Text>

      <View style={styles.notificationItem}>
        <Text>Email Notifications</Text>
        <Switch
          value={emailNotifications}
          onValueChange={(value) => {
            setEmailNotifications(value);
            handleToggle('Email', value);
          }}
        />
      </View>

      <View style={styles.notificationItem}>
        <Text>Push Notifications</Text>
        <Switch
          value={pushNotifications}
          onValueChange={(value) => {
            setPushNotifications(value);
            handleToggle('Push', value);
          }}
        />
      </View>

      <View style={styles.notificationItem}>
        <Text>SMS Notifications</Text>
        <Switch
          value={smsNotifications}
          onValueChange={(value) => {
            setSmsNotifications(value);
            handleToggle('SMS', value);
          }}
        />
      </View>

      <View style={styles.notificationItem}>
        <Text>WhatsApp Notifications</Text>
        <Switch
          value={whatsappNotifications}
          onValueChange={(value) => {
            setWhatsappNotifications(value);
            handleToggle('WhatsApp', value);
          }}
        />
      </View>

      <View style={styles.notificationItem}>
        <Text>Sales & Promotions Emails</Text>
        <Switch
          value={salesPromotions}
          onValueChange={(value) => {
            setSalesPromotions(value);
            handleToggle('Promotions', value);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    fontSize: 16,
    color: 'black',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
});

export default NotificationsScreen;
