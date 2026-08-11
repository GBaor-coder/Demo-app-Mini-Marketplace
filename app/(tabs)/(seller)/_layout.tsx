import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow } from '@/src/theme/colors';

type TabIconProps = {
  color: string;
  focused: boolean;
};

function tabIcon(name: keyof typeof Ionicons.glyphMap, active: keyof typeof Ionicons.glyphMap) {
  const TabIcon = ({ color, focused }: TabIconProps) => (
    <Ionicons name={focused ? active : name} size={24} color={color} />
  );
  TabIcon.displayName = 'TabIcon';
  return TabIcon;
}

export default function SellerTabLayout() {
  const { currentUser, hydrated } = useStore();

  if (!hydrated) {
    return null;
  }
  if (!currentUser) {
    return <Redirect href="/login" />;
  }
  if (currentUser.role !== 'seller') {
    return <Redirect href="/(tabs)/(buyer)" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarActiveBackgroundColor: 'rgba(0,74,198,0.10)',
        tabBarInactiveBackgroundColor: 'transparent',
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarStyle: styles.bar,
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Tổng quan', tabBarIcon: tabIcon('stats-chart-outline', 'stats-chart') }}
      />
      <Tabs.Screen
        name="products"
        options={{ title: 'Sản phẩm', tabBarIcon: tabIcon('cube-outline', 'cube') }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Đăng bán',
          tabBarIcon: () => <Ionicons name="add-circle" size={28} color={colors.primary} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: 'Đơn bán', tabBarIcon: tabIcon('receipt-outline', 'receipt') }}
      />
      <Tabs.Screen
        name="store"
        options={{ title: 'Cửa hàng', tabBarIcon: tabIcon('storefront-outline', 'storefront') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: 'rgba(248,249,255,0.92)',
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    borderTopWidth: 1,
    height: 80,
    paddingHorizontal: 8,
    paddingTop: 8,
    ...shadow.level1,
  },
  item: {
    borderRadius: radius.xl,
    marginHorizontal: 2,
    marginVertical: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});
