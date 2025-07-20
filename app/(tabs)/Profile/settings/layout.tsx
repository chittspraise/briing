import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
      <Stack.Screen name="accountDetails" options={{ title: 'Account Details' }} />
      <Stack.Screen name="editProfile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="passwordReset" options={{ title: 'Reset Password' }} />
      <Stack.Screen name="payment" options={{ title: 'Payment' }} />
      <Stack.Screen name="payout" options={{ title: 'Payout' }} />
      <Stack.Screen name="wallet" options={{ title: 'Wallet' }} />
    </Stack>
  );
}
