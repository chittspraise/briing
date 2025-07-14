import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';

const NotificationsScreen: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [whatsAppNotifications, setWhatsAppNotifications] = useState(true);
  const [emailSalesPromotions, setEmailSalesPromotions] = useState(true);

  const toggleSwitch = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    currentValue: boolean,
    label: string
  ) => {
    setter(!currentValue);
    Alert.alert(
      'Notification Setting',
      `${label} notifications ${!currentValue ? 'enabled' : 'disabled'}.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => Alert.alert('Back', 'Go back to previous screen')}>
            <Text style={styles.backButton}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Status Updates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status updates on orders</Text>
          <Text style={styles.sectionDescription}>
            Different types of notifications regarding your activity on Grabr.
          </Text>

          {[
            { label: 'Email', value: emailNotifications, setter: setEmailNotifications },
            { label: 'Push notifications', value: pushNotifications, setter: setPushNotifications },
            { label: 'SMS', value: smsNotifications, setter: setSmsNotifications },
          ].map(({ label, value, setter }) => (
            <View key={label} style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>{label}</Text>
              <Switch
                trackColor={{ false: '#767577', true: '#000000' }}
                thumbColor={value ? '#FFFFFF' : '#F4F3F4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => toggleSwitch(setter, value, label)}
                value={value}
              />
            </View>
          ))}
        </View>

        {/* Tips and Offers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips and offers</Text>
          <Text style={styles.sectionDescription}>
            Product inspiration, travel pro tips, exclusive offers, personalized support and more.
          </Text>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>WhatsApp</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#000000' }}
              thumbColor={whatsAppNotifications ? '#FFFFFF' : '#F4F3F4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() =>
                toggleSwitch(setWhatsAppNotifications, whatsAppNotifications, 'WhatsApp')
              }
              value={whatsAppNotifications}
            />
          </View>
        </View>

        {/* Sales and Promotions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sales and Promotions</Text>
          <Text style={styles.sectionDescription}>
            Receive coupons, promotions, surveys, product updates, and inspiration from Grabr and
            partners.
          </Text>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Email</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#000000' }}
              thumbColor={emailSalesPromotions ? '#FFFFFF' : '#F4F3F4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() =>
                toggleSwitch(setEmailSalesPromotions, emailSalesPromotions, 'Sales & Promotions Email')
              }
              value={emailSalesPromotions}
            />
          </View>
        </View>

        {/* New Orders Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New order notifications</Text>
          <Text style={styles.sectionDescription}>
            Push and email notifications about new orders along your route.
          </Text>
        </View>
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
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 15,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#000000',
  },
});

export default NotificationsScreen;
