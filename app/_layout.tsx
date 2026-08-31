import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { StoreProvider } from '@/src/context/store-context';
import { supabase } from '@/src/lib/supabase';
import { colors } from '@/src/theme/colors';

export default function RootLayout() {
  useEffect(() => {
    const handleAuthUrl = async (urlString: string) => {
      if (!urlString) return;

      try {
        const hashIndex = urlString.indexOf('#');
        if (hashIndex === -1) return;

        const fragment = urlString.substring(hashIndex + 1);
        if (fragment.includes('access_token')) {
          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }
      } catch {
        // ignore
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleAuthUrl(url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) handleAuthUrl(url);
    });

    return () => subscription.remove();
  }, []);

  return (
    <StoreProvider>
      <StatusBar backgroundColor={colors.background} style="dark" />
      <Stack
        screenOptions={{
          gestureEnabled: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="register" options={{ animation: 'fade' }} />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="reset-success" />
        <Stack.Screen name="verify-email" options={{ animation: 'fade' }} />
        <Stack.Screen name="change-password" />
        <Stack.Screen name="delete-account" />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="search" />
        <Stack.Screen name="search-results" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="product-form" options={{ presentation: 'formSheet' }} />
        <Stack.Screen name="product-preview" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="location-select" />
        <Stack.Screen name="order-success" />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="order-tracking" />
        <Stack.Screen name="order-cancel" options={{ presentation: 'formSheet' }} />
        <Stack.Screen name="order-rate" options={{ presentation: 'formSheet' }} />
        <Stack.Screen name="seller-order/[id]" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="addresses" />
        <Stack.Screen name="address-form" options={{ presentation: 'formSheet' }} />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="seller-notifications" />
        <Stack.Screen name="map" />
        <Stack.Screen name="report" />
        <Stack.Screen name="status" />
      </Stack>
    </StoreProvider>
  );
}
