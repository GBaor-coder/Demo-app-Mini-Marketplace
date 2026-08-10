import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { AppNotification, NotificationType } from '@/src/types';
import { formatRelativeTime } from '@/src/utils/format';

const ICONS: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  order: 'cube-outline',
  message: 'chatbubble-ellipses-outline',
  other: 'megaphone-outline',
};

const TABS: { key: NotificationType; label: string }[] = [
  { key: 'order', label: 'Đơn hàng' },
  { key: 'message', label: 'Tin nhắn' },
  { key: 'other', label: 'Khác' },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notifications, markNotificationsRead } = useStore();
  const [tab, setTab] = useState<NotificationType>('order');

  const list = tab === 'order' ? notifications : notifications.filter((n) => n.type === tab);

  useEffect(() => {
    const timer = setTimeout(() => markNotificationsRead(), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = ({ item }: { item: AppNotification }) => (
    <View style={[styles.card, item.read && styles.cardRead]}>
      <View style={[styles.iconWrap, !item.read && styles.iconWrapUnread]}>
        <Ionicons
          name={ICONS[item.type] ?? 'megaphone-outline'}
          size={22}
          color={item.read ? colors.onSurfaceVariant : colors.primary}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.titleText} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
      {!item.read ? <View style={styles.unreadDot} /> : null}
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Thông báo</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.tabs}>
        {TABS.map((item) => {
          const active = tab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.8}
              onPress={() => setTab(item.key)}
              style={[styles.tab, active && styles.tabActive]}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-outline"
            title="Chưa có thông báo nào"
            description="Bạn sẽ nhận được thông báo khi có cập nhật về đơn hàng, tin nhắn và chương trình."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.94)',
    flexDirection: 'row',
    paddingBottom: 10,
    paddingHorizontal: 12,
    ...shadow.level1,
  },
  headerBtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  title: {
    ...typography.headlineSm,
    color: colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  tabs: {
    borderBottomColor: 'rgba(195,198,215,0.3)',
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  tab: {
    alignItems: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.button,
    color: colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: colors.primary,
  },
  list: {
    gap: 8,
    padding: 20,
  },
  card: {
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    ...shadow.level1,
  },
  cardRead: {
    opacity: 0.7,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.full,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  iconWrapUnread: {
    backgroundColor: 'rgba(37,99,235,0.1)',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  titleText: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: '600',
  },
  body: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  time: {
    color: colors.outline,
    fontSize: 12,
    marginTop: 4,
  },
  unreadDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 8,
    position: 'absolute',
    right: 8,
    top: 8,
    width: 8,
  },
});
