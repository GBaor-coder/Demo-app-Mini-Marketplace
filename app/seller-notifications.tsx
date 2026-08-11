import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  Chip,
  EmptyState,
  MaterialIcons,
  ScreenHeader,
  toIconName,
} from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { AppNotification, NotificationType } from '@/src/types';
import { formatRelativeTime } from '@/src/utils/format';

const ICONS: Record<NotificationType, keyof typeof MaterialIcons.glyphMap> = {
  order: 'receipt-long',
  message: 'chat-bubble-outline',
  other: 'campaign',
};

const TABS: { key: NotificationType; label: string }[] = [
  { key: 'order', label: 'Đơn hàng' },
  { key: 'message', label: 'Tin nhắn' },
  { key: 'other', label: 'Khác' },
];

export default function SellerNotificationsScreen() {
  const { notifications, markNotificationsRead } = useStore();
  const [tab, setTab] = useState<NotificationType>('order');

  const list =
    tab === 'order' ? notifications : notifications.filter((n) => n.type === tab);

  useEffect(() => {
    const timer = setTimeout(() => markNotificationsRead(), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = ({ item }: { item: AppNotification }) => (
    <View style={[styles.card, item.read && styles.cardRead]}>
      {!item.read ? <View style={styles.unreadDot} /> : null}
      <View style={[styles.iconWrap, item.read && styles.iconWrapRead]}>
        <MaterialIcons
          name={toIconName(item.icon) ?? ICONS[item.type]}
          size={22}
          color={item.read ? colors.onSurfaceVariant : colors.onPrimaryContainer}
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
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Thông báo" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}>
        {TABS.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            selected={tab === item.key}
            onPress={() => setTab(item.key)}
          />
        ))}
      </ScrollView>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-active"
            title="Chưa có thông báo nào"
            description="Bạn sẽ nhận được thông báo khi có đơn hàng, tin nhắn và cập nhật từ UniLoop."
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
  tabsContent: {
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  list: {
    gap: 8,
    padding: 20,
  },
  card: {
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    position: 'relative',
    ...shadow.level1,
  },
  cardRead: {
    opacity: 0.7,
  },
  unreadDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 8,
    left: 4,
    marginTop: -4,
    position: 'absolute',
    top: '50%',
    width: 8,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  iconWrapRead: {
    backgroundColor: colors.surfaceVariant,
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
});
