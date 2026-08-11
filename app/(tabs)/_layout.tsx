import { Redirect, Stack } from 'expo-router';

import { useStore } from '@/src/context/store-context';
import { colors } from '@/src/theme/colors';

export default function TabGroupLayout() {
  const { currentUser, hydrated } = useStore();

  if (!hydrated) {
    return null;
  }
  if (!currentUser) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="(buyer)" />
      <Stack.Screen name="(seller)" />
    </Stack>
  );
}
