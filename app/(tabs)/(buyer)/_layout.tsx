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

export default function BuyerTabLayout() {
  const { currentUser, activeRole, hydrated } = useStore();

  if (!hydrated) {
    return null;
  }
  if (!currentUser) {
    return <Redirect href="/login" />;
  }
  if (activeRole !== 'buyer') {
    return <Redirect href="/(tabs)/(seller)" />;
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
        options={{ title: 'Trang chủ', tabBarIcon: tabIcon('home', 'home') }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Khám phá', tabBarIcon: tabIcon('explore', 'explore') }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: 'Đơn mua', tabBarIcon: tabIcon('receipt-long', 'receipt-long') }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarIcon: tabIcon('notifications', 'notifications'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Cá nhân', tabBarIcon: tabIcon('person', 'person') }}
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
