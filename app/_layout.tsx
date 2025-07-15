import '../polyfills';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { OrderProvider } from './providers/orderProvider';
import { TravelProvider } from './providers/travelProvider';
import { supabase } from '@/supabaseClient';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native'; // ✅ ADD THIS


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
    <StripeProvider
      publishableKey="pk_test_51QWMaiC2SQuTnTNRszks2HmWc07cc1dsHmE3sarUSAw2R9sHGr0bX9fDdVygKR7GTWF3S54VOlQpii6QQVFr3cu200uYs2qzWn" // 🔑 Use ENV in production
      merchantIdentifier="merchant.com.chitts" // optional for Apple Pay
    >
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
    </StripeProvider>
  );
}
