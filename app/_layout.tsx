import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { StoreProvider } from '@/src/context/store-context';
import { colors } from '@/src/theme/colors';

export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar backgroundColor={colors.background} style="dark" />
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="register" options={{ animation: 'fade' }} />
        <Stack.Screen name="role-select" options={{ animation: 'fade' }} />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="reset-success" />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="search" />
        <Stack.Screen name="search-results" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="product-form" />
        <Stack.Screen name="product-preview" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="location-select" />
        <Stack.Screen name="order-success" />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="order-tracking" />
        <Stack.Screen name="order-cancel" />
        <Stack.Screen name="order-rate" />
        <Stack.Screen name="seller-order/[id]" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="addresses" />
        <Stack.Screen name="address-form" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="chats" />
        <Stack.Screen name="seller-chats" />
        <Stack.Screen name="seller-notifications" />
        <Stack.Screen name="map" />
        <Stack.Screen name="report" />
        <Stack.Screen name="status" />
      </Stack>
    </StoreProvider>
  );
}
