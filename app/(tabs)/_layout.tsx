import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
// If you don't want any background component, this can be removed
// import TabBarBackground from '@/components/ui/TabBarBackground'; 

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#000', // solid black background
          borderTopWidth: 0,
          height: 60,
        },
        tabBarActiveTintColor: '#fff',   // white for active
        tabBarInactiveTintColor: '#aaa', // grey for inactive
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Orders"
        options={{
          title: 'Orders',
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color }) => <Ionicons name="cart-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Explore"
        options={{
          title: 'Explore',
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color }) => <Ionicons name="compass-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Messages"
        options={{
          title: 'Messages',
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color }) => <Ionicons name="mail-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
