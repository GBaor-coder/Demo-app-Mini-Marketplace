import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

import { LoadingScreen } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors } from '@/src/theme/colors';

export default function TabLayout() {
  const { currentUser, hydrated } = useStore();

  if (!hydrated) {
    return <LoadingScreen />;
  }
  if (!currentUser) {
    return <Redirect href="/login" />;
  }

  const seller = currentUser.role === 'seller';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#82908B',
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 70,
          paddingBottom: 8,
          paddingTop: 7,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: seller ? 'Kênh bán' : 'Khám phá',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={seller ? 'storefront-outline' : 'compass-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          href: seller ? undefined : null,
          title: 'Đăng bán',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="add-circle-outline" size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: seller ? 'Đơn bán' : 'Đơn mua',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
