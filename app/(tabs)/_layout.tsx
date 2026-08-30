import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

function createIcon({ color }: { color: string }) {
  return <MaterialIcons name="add-circle" size={28} color={color} />;
}

export default function TabLayout() {
  const { hydrated, unreadChatCount } = useStore();
  const insets = useSafeAreaInsets();

  if (!hydrated) {
    return null;
  }

  const chatBadge =
    unreadChatCount > 0 ? (unreadChatCount > 9 ? '9+' : unreadChatCount) : undefined;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarStyle: [styles.bar, { paddingBottom: insets.bottom }],
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Trang chủ', tabBarIcon: tabIcon('home', 'home') }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Đăng bán',
          tabBarIcon: createIcon,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Tin nhắn',
          tabBarIcon: tabIcon('chat', 'chat'),
          tabBarBadge: chatBadge,
          tabBarBadgeStyle: styles.badge,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: 'Đơn hàng', tabBarIcon: tabIcon('receipt-long', 'receipt-long') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Cá nhân', tabBarIcon: tabIcon('person', 'person') }}
      />
      <Tabs.Screen name="products" options={{ href: null }} />
      <Tabs.Screen name="store" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
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
  badge: {
    backgroundColor: colors.error,
    color: colors.onError,
    fontSize: 10,
    fontWeight: '700',
  },
});
