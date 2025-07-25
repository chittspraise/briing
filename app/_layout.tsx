import '../polyfills';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { OrderProvider } from './providers/orderProvider';
import { TravelProvider } from './providers/travelProvider';
import { supabase } from '@/supabaseClient';
import { useEffect, useState } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Toast, { BaseToast, ErrorToast, BaseToastProps } from 'react-native-toast-message';
import SplashVideo from '../components/SplashVideo'; // Import the new component

const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: 'green', backgroundColor: '#121212' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
      }}
      text2Style={{
        fontSize: 15,
        color: '#ccc',
      }}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: 'red', backgroundColor: '#121212' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
      }}
      text2Style={{
        fontSize: 15,
        color: '#ccc',
      }}
    />
  ),
};

WebBrowser.maybeCompleteAuthSession();

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <StripeProvider
      publishableKey="pk_test_51QWMaiC2SQuTnTNRszks2HmWc07cc1dsHmE3sarUSAw2R9sHGr0bX9fDdVygKR7GTWF3S54VOlQpii6QQVFr3cu200uYs2qzWn"
      merchantIdentifier="merchant.com.chitts"
    >
      <OrderProvider>
        <TravelProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="forgot-password" />
              <Stack.Screen name="reset-password" />
              <Stack.Screen name="must-be-signed-in" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
              <Stack.Screen name="travelPage" />
              <Stack.Screen name="OrdersPage" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </TravelProvider>
      </OrderProvider>
      <Toast config={toastConfig} />
    </StripeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [splashFinished, setSplashFinished] = useState(false);
  const [initialNavigationDone, setInitialNavigationDone] = useState(false);

  const url = Linking.useURL();
  useEffect(() => {
    if (url) {
      const { path, queryParams } = Linking.parse(url);
      if (path === 'reset-password' && queryParams?.token) {
        router.replace({
          pathname: '/reset-password',
          params: { access_token: queryParams.token, ...queryParams },
        });
        setInitialNavigationDone(true);
      }
    }
  }, [url]);

  const [sessionLoading, setSessionLoading] = useState(true);
  const [userSession, setUserSession] = useState<import('@supabase/supabase-js').User | null>(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session?.user ?? null);
      setSessionLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (sessionLoading || !splashFinished || initialNavigationDone) return;

    if (userSession) {
      router.replace('/(tabs)/Home');
    } else {
      router.replace('/');
    }
    setInitialNavigationDone(true);
  }, [userSession, sessionLoading, splashFinished, initialNavigationDone]);

  if (!loaded) {
    return null; // Or a minimal loading indicator
  }

  return (
    <>
      {!splashFinished ? (
        <SplashVideo onFinish={() => setSplashFinished(true)} />
      ) : (
        <RootLayoutNav />
      )}
    </>
  );
}
