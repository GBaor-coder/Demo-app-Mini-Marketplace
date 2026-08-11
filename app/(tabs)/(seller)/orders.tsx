import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Avatar } from '@/src/components/Avatar';
import { Button, Chip, EmptyState, ScreenHeader, StatusBadge } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { Order, OrderStatus } from '@/src/types';
import { formatCurrency, formatRelativeTime } from '@/src/utils/format';

type TabFilter = 'all' | OrderStatus;

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'in_transaction', label: 'Đang giao dịch' },
  { key: 'completed', label: 'Hoàn tất' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export default function SellerOrdersTab() {
  const router = useRouter();
  const { currentUser, orders, getUserById, updateOrderStatus } = useStore();
  const [tab, setTab] = useState<TabFilter>('pending');

  const myOrders = useMemo(() => {
    if (!currentUser) return [];
    const mine = orders.filter((o) => o.sellerId === currentUser.id);
    if (tab === 'all') return mine;
    if (tab === 'cancelled') {
      return mine.filter((o) => o.status === 'cancelled' || o.status === 'rejected');
    }
    return mine.filter((o) => o.status === tab);
  }, [currentUser, orders, tab]);

  const confirmOrder = (order: Order) => {
    Alert.alert('Xác nhận đơn hàng', 'Xác nhận đơn và bắt đầu chuẩn bị hàng cho người mua?', [
      { text: 'Để sau', style: 'cancel' },
      { text: 'Xác nhận', onPress: () => updateOrderStatus(order.id, 'confirmed') },
    ]);
  };

  const rejectOrder = (order: Order) => {
    Alert.alert(
      'Từ chối đơn hàng',
      'Bạn sẽ phải chọn lý do khi từ chối. Xác nhận từ chối đơn này?',
      [
        { text: 'Để sau', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: () => router.push(`/order-cancel?id=${order.id}&seller=1`),
        },
      ]
    );
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const buyer = getUserById(item.buyerId);
    const firstItem = item.items[0];
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/seller-order/${item.id}`)}
        style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.buyerRow}>
            <Avatar uri={buyer?.avatar} name={buyer?.name ?? 'Người mua'} size={40} />
            <View style={styles.buyerInfo}>
              <Text style={styles.buyerName}>{buyer?.name ?? 'Người mua'}</Text>
              <Text style={styles.buyerTime}>{formatRelativeTime(item.createdAt)}</Text>
            </View>
          </View>
          <StatusBadge status={item.status} small />
        </View>
        {firstItem ? (
          <View style={styles.productBox}>
            <Image source={{ uri: firstItem.image }} style={styles.thumb} contentFit="cover" />
            <View style={styles.productInfo}>
              <Text numberOfLines={2} style={styles.productTitle}>
                {firstItem.title}
              </Text>
              <Text style={styles.qty}>Qty: {firstItem.quantity}</Text>
              <Text style={styles.price}>{formatCurrency(item.total)}</Text>
            </View>
          </View>
        ) : null}
        {item.status === 'pending' ? (
          <View style={styles.actions}>
            <Button
              title="Từ chối"
              variant="tonal"
              onPress={() => rejectOrder(item)}
              style={styles.actionBtn}
            />
            <Button
              title="Xác nhận"
              onPress={() => confirmOrder(item)}
              style={styles.actionBtn}
            />
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader brand showBack={false} />

      <Text style={styles.pageTitle}>Đơn bán</Text>

      <View style={styles.tabs}>
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
      </View>

      <FlatList
        data={myOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderOrder}
        ListEmptyComponent={
          <EmptyState
            icon="inventory-2"
            title="Chưa có đơn hàng"
            description="Khi có người mua đặt hàng, đơn hàng sẽ xuất hiện ở đây."
          >
            <Button title="Về trang chủ" onPress={() => router.push('/(tabs)/(seller)')} />
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
  pageTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontSize: 20,
    marginBottom: 16,
    marginHorizontal: 20,
    marginTop: 20,
  },
  tabs: {
    paddingTop: 4,
  },
  tabsContent: {
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  list: {
    gap: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  orderCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.1)',
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 16,
    padding: 16,
    ...shadow.level1,
  },
  orderHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buyerRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  buyerInfo: {
    flex: 1,
    gap: 1,
  },
  buyerName: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  buyerTime: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  productBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderColor: 'rgba(195,198,215,0.2)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 8,
  },
  thumb: {
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 6,
    height: 80,
    width: 80,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productTitle: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  qty: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  price: {
    ...typography.labelMd,
    color: colors.primary,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
  },
});
