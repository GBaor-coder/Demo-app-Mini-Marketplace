import { Ionicons } from '@expo/vector-icons';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, SectionHeading } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors } from '@/src/theme/colors';
import { Order, OrderStatus } from '@/src/types';
import { formatCurrency, formatDate } from '@/src/utils/format';

type OrderFilter = 'all' | OrderStatus;

const STATUS_META: Record<
  OrderStatus,
  { label: string; color: string; background: string }
> = {
  pending: { label: 'Chờ xác nhận', color: colors.warning, background: colors.warningSoft },
  confirmed: { label: 'Đã xác nhận', color: colors.blue, background: colors.blueSoft },
  completed: { label: 'Hoàn tất', color: colors.primaryDark, background: colors.primarySoft },
  cancelled: { label: 'Đã hủy', color: colors.danger, background: colors.dangerSoft },
};

export default function OrdersScreen() {
  const { currentUser, orders, getUserById, updateOrderStatus } = useStore();
  const [filter, setFilter] = useState<OrderFilter>('all');
  const sellerMode = currentUser?.role === 'seller';
  const relevantOrders = useMemo(
    () =>
      orders.filter((order) =>
        sellerMode ? order.sellerId === currentUser?.id : order.buyerId === currentUser?.id
      ),
    [currentUser?.id, orders, sellerMode]
  );
  const filteredOrders = relevantOrders.filter(
    (order) => filter === 'all' || order.status === filter
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            description={
              sellerMode
                ? 'Đơn mới từ người mua sẽ xuất hiện tại đây.'
                : 'Sau khi checkout, bạn có thể theo dõi đơn tại đây.'
            }
            icon="receipt-outline"
            title="Chưa có đơn phù hợp"
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.pageHeader}>
              <View>
                <Text style={styles.pageTitle}>{sellerMode ? 'Đơn bán' : 'Đơn mua'}</Text>
                <Text style={styles.pageSubtitle}>
                  {sellerMode ? 'Xác nhận và hoàn tất giao dịch' : 'Theo dõi trạng thái đơn hàng'}
                </Text>
              </View>
              <View style={styles.headerIcon}>
                <Ionicons name="receipt-outline" size={22} color={colors.primary} />
              </View>
            </View>
            <ScrollView
              contentContainerStyle={styles.filterContent}
              horizontal
              showsHorizontalScrollIndicator={false}>
              {(
                [
                  ['all', 'Tất cả'],
                  ['pending', 'Chờ xác nhận'],
                  ['confirmed', 'Đã xác nhận'],
                  ['completed', 'Hoàn tất'],
                ] as [OrderFilter, string][]
              ).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setFilter(key)}
                  style={[styles.filterChip, filter === key && styles.filterChipActive]}>
                  <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <SectionHeading
              action={<Text style={styles.count}>{filteredOrders.length} đơn</Text>}
              title={filter === 'all' ? 'Tất cả giao dịch' : 'Kết quả lọc'}
            />
          </>
        }
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            partnerName={
              getUserById(sellerMode ? item.buyerId : item.sellerId)?.name ?? 'Thành viên UniLoop'
            }
            sellerMode={sellerMode}
            updateStatus={updateOrderStatus}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function OrderCard({
  order,
  partnerName,
  sellerMode,
  updateStatus,
}: {
  order: Order;
  partnerName: string;
  sellerMode: boolean;
  updateStatus: (id: string, status: OrderStatus) => void;
}) {
  const status = STATUS_META[order.status];
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>#{order.id}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      {order.items.slice(0, 2).map((item) => (
        <View key={item.productId} style={styles.orderItem}>
          <Image contentFit="cover" source={{ uri: item.image }} style={styles.itemImage} />
          <View style={styles.itemBody}>
            <Text numberOfLines={1} style={styles.itemTitle}>
              {item.title}
            </Text>
            <Text style={styles.itemQuantity}>x{item.quantity}</Text>
          </View>
          <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
        </View>
      ))}
      {order.items.length > 2 && (
        <Text style={styles.moreItems}>+{order.items.length - 2} sản phẩm khác</Text>
      )}

      <View style={styles.orderMeta}>
        <MetaRow
          icon={sellerMode ? 'person-outline' : 'storefront-outline'}
          label={sellerMode ? 'Người mua' : 'Người bán'}
          value={partnerName}
        />
        <MetaRow
          icon="navigate-outline"
          label={order.deliveryMethod === 'cod' ? 'Giao COD' : 'Điểm hẹn'}
          value={order.deliveryLocation.address}
        />
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{itemCount} sản phẩm</Text>
        <View style={styles.totalValueRow}>
          <Text style={styles.totalLabel}>Tổng:</Text>
          <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
        </View>
      </View>

      {sellerMode && order.status === 'pending' && (
        <View style={styles.orderActions}>
          <TouchableOpacity
            onPress={() => updateStatus(order.id, 'cancelled')}
            style={styles.cancelButton}>
            <Text style={styles.cancelText}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => updateStatus(order.id, 'confirmed')}
            style={styles.confirmButton}>
            <Ionicons name="checkmark" size={17} color={colors.white} />
            <Text style={styles.confirmText}>Xác nhận đơn</Text>
          </TouchableOpacity>
        </View>
      )}
      {sellerMode && order.status === 'confirmed' && (
        <TouchableOpacity
          onPress={() => updateStatus(order.id, 'completed')}
          style={styles.completeButton}>
          <Ionicons name="checkmark-done" size={18} color={colors.primary} />
          <Text style={styles.completeText}>Đánh dấu đã giao</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metaRow}>
      <Ionicons name={icon} size={16} color={colors.inkMuted} />
      <Text style={styles.metaLabel}>{label}:</Text>
      <Text numberOfLines={2} style={styles.metaValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  pageHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  pageTitle: { color: colors.ink, fontSize: 25, fontWeight: '900' },
  pageSubtitle: { color: colors.inkMuted, fontSize: 13, marginTop: 4 },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  filterContent: { gap: 8, paddingBottom: 22 },
  filterChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  filterChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterText: { color: colors.inkMuted, fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: colors.white },
  count: { color: colors.inkMuted, fontSize: 12 },
  orderCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  orderHeader: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 13,
  },
  orderId: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  orderDate: { color: colors.inkMuted, fontSize: 11, marginTop: 3 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 9, paddingVertical: 6 },
  statusText: { fontSize: 11, fontWeight: '800' },
  orderItem: { alignItems: 'center', flexDirection: 'row', gap: 9, paddingHorizontal: 13, paddingTop: 10 },
  itemImage: { backgroundColor: colors.primarySoft, borderRadius: 6, height: 46, width: 46 },
  itemBody: { flex: 1 },
  itemTitle: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  itemQuantity: { color: colors.inkMuted, fontSize: 11, marginTop: 3 },
  itemPrice: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  moreItems: { color: colors.primary, fontSize: 11, fontWeight: '700', paddingHorizontal: 13, paddingTop: 8 },
  orderMeta: { backgroundColor: colors.background, gap: 8, margin: 13, padding: 11 },
  metaRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 5 },
  metaLabel: { color: colors.inkMuted, fontSize: 11, fontWeight: '700' },
  metaValue: { color: colors.ink, flex: 1, fontSize: 11, lineHeight: 16 },
  totalRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 13,
  },
  totalValueRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  totalLabel: { color: colors.inkMuted, fontSize: 12 },
  totalValue: { color: colors.accent, fontSize: 16, fontWeight: '900' },
  orderActions: { flexDirection: 'row', gap: 9, padding: 13, paddingTop: 0 },
  cancelButton: {
    alignItems: 'center',
    borderColor: colors.danger,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  cancelText: { color: colors.danger, fontSize: 13, fontWeight: '800' },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flex: 2,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 42,
  },
  confirmText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  completeButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    margin: 13,
    marginTop: 0,
    minHeight: 42,
  },
  completeText: { color: colors.primaryDark, fontSize: 13, fontWeight: '800' },
});
