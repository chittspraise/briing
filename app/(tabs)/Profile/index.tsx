import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Feather,
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  notifications: undefined;
  'settings/index': undefined;
   invite : undefined;
   help:undefined;
   profile:undefined;
  // Add other routes if needed
};

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileBanner}>
        <Image
          style={styles.avatar}
          source={{ uri: 'https://placehold.co/100x100/000000/FFFFFF?text=PC' }}
        />
        <View>
          <Text style={styles.name}>Praise Chitts</Text>
          <TouchableOpacity
           onPress={() => navigation.navigate('profile')}
>
            <Text style={styles.editProfile}>Edit profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section: Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Option
          label="Notifications"
          icon={<Ionicons name="notifications-outline" size={20} color="#000" />}
          onPress={() => navigation.navigate('notifications')}
        />
        <Option
          label="Settings"
          icon={<Feather name="settings" size={20} color="#000" />}
          onPress={() => navigation.navigate('settings/index')}
        />
         
      </View>

      {/* Section: Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <Option label="Check Help Center" icon={<Feather name="menu" size={20} color="#000" />} 
                          onPress={() => navigation.navigate('help')}
        />
        <Option label="Submit a request" icon={<Feather name="edit" size={20} color="#000" />} 
                     onPress={() => navigation.navigate('help')}
/>
      </View>

      {/* Section: Referrals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Refer</Text>
        <Option label="Invite Friends" icon={<Feather name="gift" size={20} color="#000" />}
                  onPress={() => navigation.navigate('invite')}
                  />
        <Option label="Coupons" icon={<Feather name="percent" size={20} color="#000" />} />
      </View>

      {/* Section: Danger */}
      <View style={styles.section}>
        <Option label="Log Out" icon={<MaterialIcons name="logout" size={20} color="#000" />} />
      </View>
    </ScrollView>
  );
};

const Option = ({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <Text style={styles.optionText}>{label}</Text>
    {icon}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#000',
    marginRight: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  editProfile: {
    fontSize: 14,
    marginTop: 4,
    color: '#000',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#ddd',
    borderBottomWidth: 0.5,
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
});

export default ProfileScreen;
