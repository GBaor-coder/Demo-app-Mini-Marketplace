import { Ionicons } from '@expo/vector-icons';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { Order, OrderStatus } from '@/src/types';
import { formatCurrency, ORDER_STATUS_LABELS } from '@/src/utils/format';

type TabFilter = 'all' | OrderStatus;

const BUYER_TABS: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'in_transaction', label: 'Đang giao dịch' },
  { key: 'completed', label: 'Hoàn tất' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const SELLER_TABS: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'in_transaction', label: 'Đang giao dịch' },
  { key: 'completed', label: 'Hoàn tất' },
  { key: 'rejected', label: 'Đã từ chối' },
];

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, orders, getUserById, startChat } = useStore();
  const [tab, setTab] = useState<TabFilter>('all');

  const isSeller = currentUser?.role === 'seller';
  const tabs = isSeller ? SELLER_TABS : BUYER_TABS;

  const myOrders = useMemo(() => {
    if (!currentUser) {
      return [];
    }
    const mine = orders.filter((order) =>
      isSeller ? order.sellerId === currentUser.id : order.buyerId === currentUser.id
    );
    if (tab === 'all') {
      return mine;
    }
    return mine.filter((order) => order.status === tab);
  }, [currentUser, isSeller, orders, tab]);

  const renderOrder = ({ item }: { item: Order }) => {
    const seller = getUserById(item.sellerId);
    const firstItem = item.items[0];
    const statusColor =
      item.status === 'completed' || item.status === 'in_transaction'
        ? colors.tertiary
        : item.status === 'cancelled' || item.status === 'rejected'
          ? colors.error
          : item.status === 'pending'
            ? colors.outline
            : colors.primary;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          router.push(
            isSeller ? `/seller-order/${item.id}` : `/order/${item.id}`
          )
        }
        style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.sellerRow}>
            <Ionicons name="storefront" size={18} color={colors.primary} />
            <Text style={styles.sellerName}>{seller?.name ?? 'Người bán'}</Text>
          </View>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {ORDER_STATUS_LABELS[item.status]}
          </Text>
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
            title={isSeller ? 'Liên hệ người mua' : 'Liên hệ người bán'}
            variant="ghost"
            size="sm"
            compact
            style={styles.contactBtn}
            onPress={() => {
              const otherId = isSeller ? item.buyerId : item.sellerId;
              const threadId = startChatOrFallback(otherId, firstItem?.productId ?? '');
              if (threadId) {
                router.push(`/chat/${threadId}`);
              }
            }}
          />
          <Button
            title="Xem chi tiết"
            size="sm"
            compact
            style={styles.detailBtn}
            onPress={() =>
              router.push(
                isSeller ? `/seller-order/${item.id}` : `/order/${item.id}`
              )
            }
          />
        </View>
      </TouchableOpacity>
    );
  };

  function startChatOrFallback(sellerId: string, productId: string) {
    if (!sellerId) {
      return '';
    }
    try {
      return startChat(sellerId, productId);
    } catch {
      return '';
    }
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerTop}>
          <Text style={styles.brand}>UniLoop</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/search')}
            style={styles.headerIcon}>
            <Ionicons name="search" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}>
          {tabs.map((item) => {
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
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="cube-outline" size={72} color={colors.surfaceDim} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
            <Text style={styles.emptyText}>
              Bạn chưa thực hiện giao dịch nào. Hãy khám phá chợ sinh viên để tìm
              những món đồ thú vị nhé!
            </Text>
            <Button
              title="Tiếp tục khám phá"
              icon="compass-outline"
              onPress={() => router.push('/(tabs)')}
              style={styles.exploreBtn}
            />
          </View>
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
    backgroundColor: 'rgba(248,249,255,0.92)',
    paddingHorizontal: 20,
    ...shadow.level1,
  },
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
  },
  brand: {
    ...typography.headlineMd,
    color: colors.primary,
    fontWeight: '700',
  },
  headerIcon: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  tabs: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 24,
    height: 48,
    paddingRight: 20,
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
    borderRadius: radius['2xl'],
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
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  productRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 8,
  },
  thumb: {
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 8,
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
    borderRadius: radius.xl,
  },
  detailBtn: {
    borderRadius: radius.xl,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingBottom: 64,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(220,233,255,0.6)',
    borderRadius: radius.full,
    height: 168,
    justifyContent: 'center',
    marginBottom: 24,
    width: 168,
  },
  emptyTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: 32,
    maxWidth: 280,
    textAlign: 'center',
  },
  exploreBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
    paddingHorizontal: 32,
  },
});
