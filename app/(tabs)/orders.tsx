import { Image } from 'expo-image';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/Avatar';
import { Button, Chip, EmptyState, MaterialIcons, ScreenHeader, SkeletonCard, StatusBadge } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { Order, OrderStatus } from '@/src/types';
import { formatCurrency, formatRelativeTime } from '@/src/utils/format';

type TabFilter = 'buyer' | 'seller';

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'buyer', label: 'Đơn mua' },
  { key: 'seller', label: 'Đơn bán' },
];

const BUYER_STATUS_TABS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'in_transaction', label: 'Đang giao dịch' },
  { key: 'completed', label: 'Hoàn tất' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const SELLER_STATUS_TABS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'in_transaction', label: 'Đang giao dịch' },
  { key: 'completed', label: 'Hoàn tất' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export default function OrdersScreen() {
  const router = useRouter();
  const { currentUser, orders, getUserById, updateOrderStatus } = useStore();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabFilter>('buyer');
  const [statusTab, setStatusTab] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const loadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoading = useCallback(() => {
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
    setLoading(true);
    loadingTimer.current = setTimeout(() => setLoading(false), 500);
  }, []);

  const switchTab = (newTab: TabFilter) => {
    setTab(newTab);
    setStatusTab('all');
    startLoading();
  };

  const switchStatus = (status: OrderStatus | 'all') => {
    setStatusTab(status);
    startLoading();
  };

  const myOrders = useMemo(() => {
    if (!currentUser) return [];
    const mine = orders.filter((o) =>
      tab === 'buyer' ? o.buyerId === currentUser.id : o.sellerId === currentUser.id
    );
    if (statusTab === 'all') return mine;
    if (statusTab === 'cancelled') {
      return mine.filter((o) => o.status === 'cancelled' || o.status === 'rejected');
    }
    return mine.filter((o) => o.status === statusTab);
  }, [currentUser, orders, statusTab, tab]);

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
    const isBuyer = tab === 'buyer';
    const other = isBuyer ? getUserById(item.sellerId) : getUserById(item.buyerId);
    const firstItem = item.items[0];

    if (isBuyer) {
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push(`/order/${item.id}`)}
          style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View style={styles.sellerRow}>
              <MaterialIcons name="storefront" size={18} color={colors.primary} />
              <Text style={styles.sellerName}>{other?.name ?? 'Người bán'}</Text>
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
              title="Xem chi tiết"
              size="sm"
              style={styles.detailBtn}
              onPress={() => router.push(`/order/${item.id}`)}
            />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/seller-order/${item.id}`)}
        style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.buyerRow}>
            <Avatar uri={other?.avatar} name={other?.name ?? 'Người mua'} size={40} />
            <View style={styles.buyerInfo}>
              <Text style={styles.buyerName}>{other?.name ?? 'Người mua'}</Text>
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

  const statusTabs = tab === 'buyer' ? BUYER_STATUS_TABS : SELLER_STATUS_TABS;

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Đơn hàng của tôi" showBack={false} />

      <View style={styles.typeTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeTabsContent}>
          {TABS.map((item) => (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.8}
              onPress={() => {
                switchTab(item.key);
              }}
              style={[styles.typeTab, tab === item.key && styles.typeTabActive]}>
              <Text style={[styles.typeTabText, tab === item.key && styles.typeTabTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.statusTabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusTabs}>
          {statusTabs.map((item) => (
            <Chip
              key={item.key}
              label={item.label}
              selected={statusTab === item.key}
              onPress={() => switchStatus(item.key)}
            />
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={[styles.list, { paddingBottom: insets.bottom + 24 }]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} imageHeight={80} />
          ))}
        </View>
      ) : (
        <FlatList
          data={myOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          renderItem={renderOrder}
          ListEmptyComponent={
            <EmptyState
              icon="inventory-2"
              title={tab === 'buyer' ? 'Chưa có đơn hàng nào' : 'Chưa có đơn hàng'}
              description={
                tab === 'buyer'
                  ? 'Bạn chưa thực hiện giao dịch nào. Hãy khám phá chợ sinh viên để tìm những món đồ thú vị nhé!'
                  : 'Khi có người mua đặt hàng, đơn hàng sẽ xuất hiện ở đây.'
              }
            >
              <Button
                title={tab === 'buyer' ? 'Khám phá thêm' : 'Về trang chủ'}
                onPress={() => router.push('/')}
              />
            </EmptyState>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  typeTabs: {
    backgroundColor: colors.surface,
    borderBottomColor: 'rgba(195,198,215,0.3)',
    borderBottomWidth: 1,
  },
  typeTabsContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 24,
    height: 48,
    paddingHorizontal: 20,
  },
  typeTab: {
    alignItems: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    justifyContent: 'center',
    paddingBottom: 8,
    paddingHorizontal: 2,
  },
  typeTabActive: {
    borderBottomColor: colors.primary,
  },
  typeTabText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  typeTabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  statusTabsWrap: {
    height: 64,
  },
  statusTabs: {
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  list: {
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
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
  actionBtn: {
    flex: 1,
  },
});
