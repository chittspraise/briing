import '../polyfills';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { OrderProvider } from './providers/orderProvider';
import { TravelProvider } from './providers/travelProvider';
import { AuthProvider, useAuth } from './providers/authProvider'; // Import AuthProvider and useAuth
import NotificationProvider from './providers/notificationProvider';
import MessageProvider from './providers/messageProvider';
import { useEffect, useState } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Toast, { BaseToast, ErrorToast, BaseToastProps } from 'react-native-toast-message';
import SplashVideo from '../components/SplashVideo'; // Import the new component
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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

import { usePathname } from 'expo-router';

// ... (other imports)

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = ['/', '/forgot-password', '/reset-password', '/must-be-signed-in'].includes(pathname);

    // If the user is logged in, and they are on a public-only route like the index, redirect them to the app's home screen.
    if (session && pathname === '/') {
      router.replace('/(tabs)/Home');
    } 
    // If the user is not logged in, and they are trying to access a protected route, redirect them to the sign-in page.
    else if (!session && !isPublicRoute) {
      router.replace('/must-be-signed-in');
    }
  }, [session, loading, pathname]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StripeProvider
        publishableKey="pk_test_51QWMaiC2SQuTnTNRszks2HmWc07cc1dsHmE3sarUSAw2R9sHGr0bX9fDdVygKR7GTWF3S54VOlQpii6QQVFr3cu200uYs2qzWn"
        merchantIdentifier="merchant.com.chitts"
      >
        <OrderProvider>
          <TravelProvider>
            <NotificationProvider>
              <MessageProvider>
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
              </MessageProvider>
            </NotificationProvider>
          </TravelProvider>
        </OrderProvider>
        <Toast config={toastConfig} />
      </StripeProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [splashFinished, setSplashFinished] = useState(false);

  const url = Linking.useURL();
  useEffect(() => {
    if (url) {
      const { path, queryParams } = Linking.parse(url);
      if (path === 'reset-password' && queryParams?.token) {
        router.replace({
          pathname: '/reset-password',
          params: { access_token: queryParams.token, ...queryParams },
        });
      }
    }
  }, [url]);

  if (!loaded) {
    return null; // Or a minimal loading indicator
  }

  return (
    <AuthProvider>
      {!splashFinished ? (
        <SplashVideo onFinish={() => setSplashFinished(true)} />
      ) : (
        <RootLayoutNav />
      )}
    </AuthProvider>
  );
}

