import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Button,
  EmptyState,
  IconButton,
  MaterialIcons,
  ScreenHeader,
  StatusBadge,
  toIconName,
} from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { Order, OrderStatus } from '@/src/types';
import { formatCurrency } from '@/src/utils/format';

type TabFilter = 'all' | OrderStatus;

const BUYER_TABS: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'in_transaction', label: 'Đang giao dịch' },
  { key: 'completed', label: 'Hoàn tất' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export default function BuyerOrdersScreen() {
  const router = useRouter();
  const { currentUser, orders, getUserById, startChat } = useStore();
  const [tab, setTab] = useState<TabFilter>('all');

  const myOrders = useMemo(() => {
    if (!currentUser) {
      return [];
    }
    const mine = orders.filter((order) => order.buyerId === currentUser.id);
    if (tab === 'all') {
      return mine;
    }
    return mine.filter((order) => order.status === tab);
  }, [currentUser, orders, tab]);

  const renderOrder = ({ item }: { item: Order }) => {
    const seller = getUserById(item.sellerId);
    const firstItem = item.items[0];

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/order/${item.id}`)}
        style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.sellerRow}>
            <MaterialIcons name="storefront" size={18} color={colors.primary} />
            <Text style={styles.sellerName}>{seller?.name ?? 'Người bán'}</Text>
          </View>
          <StatusBadge status={item.status} size="sm" />
        </View>
        <View style={styles.productRow}>
          {firstItem ? (
            <>
              <Image
                contentFit="cover"
                source={{ uri: firstItem.image }}
                style={styles.thumb}
              />
              <View style={styles.productInfo}>
                <Text numberOfLines={2} style={styles.productTitle}>
                  {firstItem.title}
                </Text>
                <View style={styles.productBottom}>
                  <Text style={styles.qty}>x{firstItem.quantity}</Text>
                  <Text style={styles.price}>{formatCurrency(item.total)}</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>
        <View style={styles.actions}>
          <Button
            title="Liên hệ người bán"
            variant="ghost"
            size="sm"
            style={styles.contactBtn}
            onPress={() => {
              const threadId = startChat(item.sellerId, firstItem?.productId ?? '');
              if (threadId) {
                router.push(`/chat/${threadId}`);
              }
            }}
          />
          <Button
            title="Xem chi tiết"
            size="sm"
            style={styles.detailBtn}
            onPress={() => router.push(`/order/${item.id}`)}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        brand
        right={
          <IconButton
            name="search"
            color={colors.primary}
            onPress={() => router.push('/search')}
          />
        }
      />

      <View style={styles.tabsBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}>
          {BUYER_TABS.map((item) => {
            const active = tab === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.8}
                onPress={() => setTab(item.key)}
                style={[styles.tab, active && styles.tabActive]}>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={myOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderOrder}
        ListEmptyComponent={
          <EmptyState
            icon={toIconName('cube_outline')}
            title="Chưa có đơn hàng nào"
            description="Bạn chưa thực hiện giao dịch nào. Hãy khám phá chợ sinh viên để tìm những món đồ thú vị nhé!"
          >
            <Button
              title="Tiếp tục khám phá"
              icon={toIconName('compass_outline')}
              onPress={() => router.push('/(tabs)/(buyer)/explore')}
            />
          </EmptyState>
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
  tabsBar: {
    backgroundColor: colors.surface,
    borderBottomColor: 'rgba(195,198,215,0.3)',
    borderBottomWidth: 1,
  },
  tabs: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 24,
    height: 48,
    paddingHorizontal: 20,
  },
  tab: {
    alignItems: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    justifyContent: 'center',
    paddingBottom: 8,
    paddingHorizontal: 2,
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: colors.primary,
  },
  list: {
    padding: 20,
    gap: 16,
  },
  orderCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    gap: 8,
    padding: 16,
    ...shadow.level1,
  },
  orderHeader: {
    alignItems: 'center',
    borderBottomColor: 'rgba(195,198,215,0.2)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  sellerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  sellerName: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  productRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 8,
  },
  thumb: {
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: radius.sm,
    height: 80,
    width: 80,
  },
  productInfo: {
    flex: 1,
    gap: 8,
    justifyContent: 'space-between',
  },
  productTitle: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  productBottom: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qty: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
  },
  price: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    paddingTop: 8,
  },
  contactBtn: {
    backgroundColor: 'rgba(33,112,228,0.1)',
    borderRadius: radius.lg,
  },
  detailBtn: {
    borderRadius: radius.lg,
  },
});
