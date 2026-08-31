import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarProps,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigatorProps,
} from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';
import { ReactElement } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

function createIcon() {
  return <MaterialIcons name="add-circle" size={28} color={colors.primary} />;
}

const HIDDEN_ROUTES = new Set(['explore', 'products', 'store', 'notifications']);

const MaterialTopTabs = createMaterialTopTabNavigator();

type ExpoRouterTabOptions = MaterialTopTabNavigationOptions & { href?: string | null };

const ExpoRouterTopTabs = withLayoutContext<
  ExpoRouterTabOptions,
  typeof MaterialTopTabs.Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(MaterialTopTabs.Navigator) as unknown as {
  (props: Partial<MaterialTopTabNavigatorProps>): ReactElement;
  Screen: (props: { name: string; options?: ExpoRouterTabOptions }) => ReactElement | null;
};

export default function TabLayout() {
  const { hydrated, unreadChatCount } = useStore();
  const insets = useSafeAreaInsets();

  if (!hydrated) {
    return null;
  }

  const chatBadge =
    unreadChatCount > 0 ? (unreadChatCount > 9 ? '9+' : unreadChatCount) : undefined;

  return (
    <ExpoRouterTopTabs
      tabBarPosition="bottom"
      tabBar={({ state, descriptors, navigation }: MaterialTopTabBarProps) => {
        const visibleRoutes = state.routes.filter((route) => !HIDDEN_ROUTES.has(route.name));
        return (
          <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
            {visibleRoutes.map((route) => {
              const index = state.routes.findIndex((r) => r.key === route.key);
              const focused = state.index === index;
              const { options } = descriptors[route.key];
              const color = focused ? colors.primary : colors.onSurfaceVariant;
              const label =
                typeof options.tabBarLabel === 'string'
                  ? options.tabBarLabel
                  : options.title ?? route.name;
              const icon = options.tabBarIcon?.({
                color,
                focused,
              });
              const onPress = () => {
                if (!focused) {
                  navigation.navigate(route.name);
                }
              };
              return (
                <TouchableOpacity
                  key={route.key}
                  activeOpacity={0.85}
                  onPress={onPress}
                  style={styles.item}>
                  <View style={styles.iconWrap}>
                    {icon}
                    {route.name === 'chats' && chatBadge ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{chatBadge}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.label, { color }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      }}
      screenOptions={{
        swipeEnabled: false,
        animationEnabled: true,
        lazy: true,
        lazyPreloadDistance: 1,
      }}>
      <ExpoRouterTopTabs.Screen
        name="index"
        options={{ title: 'Trang chủ', tabBarIcon: tabIcon('home', 'home') }}
      />
      <ExpoRouterTopTabs.Screen name="explore" options={{ href: null }} />
      <ExpoRouterTopTabs.Screen
        name="create"
        options={{
          title: 'Đăng bán',
          tabBarIcon: createIcon,
        }}
      />
      <ExpoRouterTopTabs.Screen name="chats" options={{ title: 'Tin nhắn', tabBarIcon: tabIcon('chat', 'chat') }} />
      <ExpoRouterTopTabs.Screen
        name="orders"
        options={{ title: 'Đơn hàng', tabBarIcon: tabIcon('receipt-long', 'receipt-long') }}
      />
      <ExpoRouterTopTabs.Screen
        name="profile"
        options={{ title: 'Cá nhân', tabBarIcon: tabIcon('person', 'person') }}
      />
      <ExpoRouterTopTabs.Screen name="products" options={{ href: null }} />
      <ExpoRouterTopTabs.Screen name="store" options={{ href: null }} />
      <ExpoRouterTopTabs.Screen name="notifications" options={{ href: null }} />
    </ExpoRouterTopTabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.92)',
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 8,
    paddingTop: 8,
    ...shadow.level1,
  },
  item: {
    alignItems: 'center',
    borderRadius: radius.lg,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 2,
    marginVertical: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  iconWrap: {
    position: 'relative',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderColor: '#fff',
    borderRadius: radius.full,
    borderWidth: 1.5,
    height: 16,
    justifyContent: 'center',
    minWidth: 16,
    paddingHorizontal: 3,
    position: 'absolute',
    right: -8,
    top: -4,
  },
  badgeText: {
    color: colors.onError,
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 12,
  },
});
