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
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="product/edit/[id]" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="checkout" />
      </Stack>
    </StoreProvider>
  );
}
