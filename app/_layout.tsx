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
import { View, Text, ActivityIndicator, Linking } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

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

    const urlListener = Linking.addEventListener('url', async ({ url }) => {
      const { error } = await supabase.auth.exchangeCodeForSession(url);
      if (error) console.error('Deep link session exchange failed:', error);
    });

    return () => {
      listener?.subscription.unsubscribe();
      urlListener.remove();
    };
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
      publishableKey="pk_test_51QWMaiC2SQuTnTNRszks2HmWc07cc1dsHmE3sarUSAw2R9sHGr0bX9fDdVygKR7GTWF3S54VOlQpii6QQVFr3cu200uYs2qzWn"
      merchantIdentifier="merchant.com.chitts"
    >
      <OrderProvider>
        <TravelProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              {/* Allow deep link access regardless of login */}
              <Stack.Screen name="(tabs)/Profile/settings/passwordReset" />

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
