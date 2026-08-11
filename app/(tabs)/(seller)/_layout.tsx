import { Redirect, Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { IconName, MaterialIcons } from '@/src/components/ui/Icon';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow } from '@/src/theme/colors';

type TabIconProps = {
  color: string;
  focused: boolean;
};

function tabIcon(name: IconName, filled: IconName = name) {
  const TabIcon = ({ color, focused }: TabIconProps) => (
    <MaterialIcons name={focused ? filled : name} size={22} color={color} />
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
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarStyle: styles.bar,
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Tổng quan', tabBarIcon: tabIcon('dashboard', 'dashboard') }}
      />
      <Tabs.Screen
        name="products"
        options={{ title: 'Sản phẩm', tabBarIcon: tabIcon('inventory-2', 'inventory-2') }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Đăng bán',
          tabBarIcon: ({ color }: TabIconProps) => (
            <MaterialIcons name="add-circle" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: 'Đơn bán', tabBarIcon: tabIcon('receipt-long', 'receipt-long') }}
      />
      <Tabs.Screen
        name="store"
        options={{ title: 'Cửa hàng', tabBarIcon: tabIcon('storefront', 'storefront') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: 'rgba(248,249,255,0.92)',
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    borderTopWidth: 1,
    height: 80,
    paddingHorizontal: 8,
    paddingTop: 8,
    ...shadow.level1,
  },
  item: {
    borderRadius: radius.lg,
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
