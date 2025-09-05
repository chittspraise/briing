import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '@/supabaseClient';
import { useRouter } from 'expo-router';
import { useNotifications } from '@/app/providers/notificationProvider';

import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  notifications: undefined;
  'settings/index': undefined;
  invite: undefined;
  help: undefined;
  profile: undefined;
  'app/index': undefined; // Main entry screen
};

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  return (
    '★'.repeat(fullStars) +
    (halfStar ? '½' : '') +
    '☆'.repeat(emptyStars)
  );
};

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const router = useRouter();
  const { notificationCount } = useNotifications();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [rating, setRating] = useState(5);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  

  const fetchProfile = useCallback(async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, image_url')
      .eq('id', user.id)
      .single();

    if (error) {
    } else if (data) {
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      if (data.image_url) {
        setAvatarUrl(data.image_url);
      }
    }

    const { data: ratingsData, error: ratingsError } = await supabase
      .from('ratings')
      .select('rating')
      .eq('rated_id', user.id);

    if (ratingsError) {
      setRating(5); // Default to 5 on error
    } else if (ratingsData && ratingsData.length > 0) {
      const avgRating =
        ratingsData.reduce((acc, r) => acc + r.rating, 0) /
        ratingsData.length;
      setRating(avgRating);
    } else {
      setRating(5); // Default to 5 if no ratings found
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    } else {
      router.replace('/'); // Navigate to the home/login screen
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Profile Header */}
        <ImageBackground
          source={require('@/assets/images/places.jpg')}
          style={styles.profileBanner}
          resizeMode="cover"
        >
          <View style={styles.bannerOverlay}>
            <Image
              style={styles.avatar}
              source={avatarUrl ? { uri: avatarUrl } : require('@/assets/images/icon.png')}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>
                {firstName || lastName ? `${firstName} ${lastName}` : 'Loading...'}
              </Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>{renderStars(rating)} ({rating.toFixed(1)})</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('profile')}>
                <Text style={styles.editProfile}>Edit profile</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.walletIcon}
              onPress={() => router.push('/(tabs)/Profile/settings/wallet')}
            >
              <Ionicons name="wallet-outline" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Section: Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <OptionWithBadge
            label="Notifications"
            icon={<Ionicons name="notifications-outline" size={20} color="#fff" />}
            onPress={() => navigation.navigate('notifications')}
            badgeCount={notificationCount}
          />
          <Option
            label="Settings"
            icon={<Feather name="settings" size={20} color="#fff" />}
            onPress={() => navigation.navigate('settings/index')}
          />
        </View>

        {/* Section: Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Option
            label="Check Help Center"
            icon={<Feather name="menu" size={20} color="#fff" />}
            onPress={() => navigation.navigate('help')}
          />
          <Option
            label="Submit a request"
            icon={<Feather name="edit" size={20} color="#fff" />}
            onPress={() => navigation.navigate('help')}
          />
        </View>

        {/* Section: Referrals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Refer</Text>
          <Option
            label="Invite Friends"
            icon={<Feather name="gift" size={20} color="#fff" />}
            onPress={() => navigation.navigate('invite')}
          />
          <Option
            label="Coupons"
            icon={<Feather name="percent" size={20} color="#fff" />}
          />
        </View>

        {/* Section: Danger */}
        <View style={styles.section}>
          <Option
            label="Log Out"
            icon={<MaterialIcons name="logout" size={20} color="#fff" />}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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

const OptionWithBadge = ({
  label,
  icon,
  onPress,
  badgeCount,
}: {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
  badgeCount: number;
}) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <Text style={styles.optionText}>{label}</Text>
    <View>
      {icon}
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
  },
  profileBanner: {
    paddingBottom: 20,
    marginBottom: 20,
    height: 200,
    justifyContent: 'center',
  },
  bannerOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20, // Added padding top
    backgroundColor: 'rgba(0,0,0,0.4)', // Added overlay
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  editProfile: {
    fontSize: 14,
    marginTop: 4,
    color: '#fff',
  },
  walletIcon: {
    padding: 10,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ccc',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#333',
    borderBottomWidth: 0.5,
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    color: '#ccc',
    fontSize: 14,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'red',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;