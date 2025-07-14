import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { OrderProvider } from './providers/orderProvider';
import { TravelProvider } from './providers/travelProvider';
import { supabase } from '@/supabaseClient';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [sessionLoading, setSessionLoading] = useState(true);
  const [userSession, setUserSession] = useState<import('@supabase/supabase-js').User | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUserSession(data.session?.user ?? null);
      setSessionLoading(false);
    };

    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session?.user ?? null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  if (!loaded || sessionLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <OrderProvider>
      <TravelProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            {!userSession ? (
              <Stack.Screen name="AuthScreen" />
            ) : (
              <>
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="+not-found" />
                <Stack.Screen name="travelPage" />
                <Stack.Screen name="OrdersPage" />
                <Stack.Screen name="notifications" />
                <Stack.Screen name="editProfile" />
                <Stack.Screen name="settings/index" />
              </>
            )}
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </TravelProvider>
    </OrderProvider>
  );
}
