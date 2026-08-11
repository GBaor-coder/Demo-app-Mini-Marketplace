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

export default function BuyerTabLayout() {
  const { currentUser, hydrated } = useStore();

  if (!hydrated) {
    return null;
  }
  if (!currentUser) {
    return <Redirect href="/login" />;
  }
  if (currentUser.role !== 'buyer') {
    return <Redirect href="/(tabs)/(seller)" />;
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
        options={{ title: 'Trang chủ', tabBarIcon: tabIcon('home-outline', 'home') }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Khám phá', tabBarIcon: tabIcon('compass-outline', 'compass') }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: 'Đơn mua', tabBarIcon: tabIcon('receipt-outline', 'receipt') }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarIcon: tabIcon('notifications-outline', 'notifications'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Cá nhân', tabBarIcon: tabIcon('person-outline', 'person') }}
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
