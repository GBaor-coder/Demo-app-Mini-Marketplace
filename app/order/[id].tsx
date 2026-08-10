import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/Avatar';
import { LocationPreview } from '@/src/components/location-preview';
import { Button, EmptyState, StatusBadge } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import {
  formatCurrency,
  formatDateTime,
  ORDER_STATUS_LABELS,
} from '@/src/utils/format';

export default function OrderDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, products, getUserById, updateOrderStatus, startChat } = useStore();
  const [updating, setUpdating] = useState(false);

  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);
  const seller = order ? getUserById(order.sellerId) : undefined;

  if (!order) {
    return (
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.title}>Chi tiết đơn hàng</Text>
          <View style={styles.headerBtn} />
        </View>
        <EmptyState
          icon="receipt-outline"
          title="Không tìm thấy đơn hàng"
          description="Đơn hàng này không tồn tại hoặc đã bị xóa."
        />
      </View>
    );
  }

  const product = products.find((p) => p.id === order.items[0]?.productId);
  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const canConfirm = order.status === 'confirmed';
  const canTrack = ['in_transaction', 'completed'].includes(order.status);

  const confirmReceipt = () => {
    Alert.alert(
      'Xác nhận đã nhận hàng',
      'Sau khi xác nhận, đơn hàng sẽ được đánh dấu là hoàn tất và người bán sẽ nhận được thanh toán.',
      [
        { text: 'Để sau', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            setUpdating(true);
            setTimeout(() => {
              updateOrderStatus(order.id, 'completed');
              setUpdating(false);
            }, 400);
          },
        },
      ]
    );
  };

  const cancelOrder = () => {
    router.push(`/order-cancel?id=${order.id}`);
  };

  const chat = () => {
    const thread = startChat(seller?.id ?? order.sellerId, order.id);
    router.push(`/chat/${thread}`);
  };

  const deliveryLabel =
    order.deliveryMethod === 'meetup' ? 'Gặp mặt trực tiếp' : 'Giao tận nơi (COD)';
  const itemTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Chi tiết đơn hàng</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.cardTitle}>Trạng thái đơn hàng</Text>
            <StatusBadge status={order.status} />
          </View>
          <Text style={styles.statusHint}>
            {order.status === 'pending'
              ? 'Đơn hàng đang chờ người bán xác nhận.'
              : order.status === 'confirmed'
                ? 'Người bán đã xác nhận. Chờ hoàn tất giao dịch.'
                : order.status === 'in_transaction'
                  ? 'Giao dịch đang diễn ra.'
                  : order.status === 'completed'
                    ? 'Đơn hàng hoàn tất. Cảm ơn bạn!'
                    : `Đơn hàng ${ORDER_STATUS_LABELS[order.status].toLowerCase()}.`}
          </Text>
          {canTrack ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(`/order-tracking?id=${order.id}`)}
              style={styles.trackLink}>
              <Ionicons name="location-outline" size={16} color={colors.primary} />
              <Text style={styles.trackLinkText}>Theo dõi vận chuyển</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.productCard}>
          {order.items.map((item, index) => (
            <TouchableOpacity
              key={`${item.productId}-${index}`}
              activeOpacity={0.85}
              onPress={() => router.push(`/product/${item.productId}`)}
              style={[styles.itemRow, index > 0 && styles.itemDivider]}>
              <Image
                source={{ uri: item.image || product?.images[0] || product?.image }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.itemMeta}>
                  x{item.quantity} · {item.condition ?? ''}
                </Text>
                <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={styles.sellerRow}>
            <Avatar uri={seller?.avatar} name={seller?.name} size={40} />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName} numberOfLines={1}>
                {seller?.name ?? 'Người bán'}
              </Text>
              <Text style={styles.sellerMeta} numberOfLines={1}>
                {seller?.campus ?? 'Người bán'}
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.85} onPress={chat} style={styles.chatBtn}>
              <Ionicons name="chatbubble-ellipses-outline" size={19} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.deliveryHeader}>
            <Ionicons name="people-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Giao dịch: {deliveryLabel}</Text>
          </View>
          <LocationPreview location={order.deliveryLocation} />
          {order.note ? (
            <View style={styles.deliveryRow}>
              <View style={styles.deliveryIcon}>
                <Ionicons name="document-text-outline" size={19} color={colors.primary} />
              </View>
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryLabel}>Ghi chú</Text>
                <Text style={styles.deliveryValue}>{order.note}</Text>
              </View>
            </View>
          ) : null}
          <View style={styles.deliveryRow}>
            <View style={styles.deliveryIcon}>
              <Ionicons name="time-outline" size={19} color={colors.primary} />
            </View>
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryLabel}>Thời gian đặt</Text>
              <Text style={styles.deliveryValue}>{formatDateTime(order.createdAt)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tổng kết thanh toán</Text>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Tạm tính</Text>
            <Text style={styles.feeValue}>{formatCurrency(itemTotal)}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Phí vận chuyển</Text>
            <Text style={styles.feeValue}>
              {order.shippingFee === 0 ? 'Miễn phí' : formatCurrency(order.shippingFee)}
            </Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Phí nền tảng</Text>
            <Text style={styles.feeValue}>{formatCurrency(order.platformFee)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {canCancel ? (
          <Button title="Hủy đơn hàng" variant="outline" danger onPress={cancelOrder} style={styles.footerBtn} />
        ) : null}
        {canConfirm ? (
          <Button title="Đã nhận được hàng" loading={updating} onPress={confirmReceipt} style={styles.footerBtn} />
        ) : (
          <Button title="Liên hệ người bán" icon="chatbubble-ellipses-outline" onPress={chat} style={styles.footerBtn} />
        )}
      </View>
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
    width: 36,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
    flex: 1,
    textAlign: 'center',
  },
  body: {
    gap: 16,
    padding: 20,
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
    padding: 16,
    ...shadow.level1,
  },
  statusHeader: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontSize: 18,
  },
  statusHint: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
    textAlign: 'center',
  },
  trackLink: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginTop: 12,
  },
  trackLinkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  productCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    ...shadow.level1,
  },
  itemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  itemDivider: {
    borderTopColor: colors.outlineVariant,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  itemImage: {
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: radius.lg,
    height: 80,
    width: 80,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  itemMeta: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
  },
  itemPrice: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  sellerRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  sellerInfo: {
    flex: 1,
    gap: 2,
  },
  sellerName: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '700',
  },
  sellerMeta: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
  chatBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.1)',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
    gap: 4,
    padding: 16,
    ...shadow.level1,
  },
  deliveryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  deliveryRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
  },
  deliveryIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderRadius: radius.full,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  deliveryInfo: {
    flex: 1,
    gap: 2,
  },
  deliveryLabel: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  deliveryValue: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 19,
  },
  feeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  feeLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
  },
  feeValue: {
    color: colors.onSurface,
    fontSize: 14,
  },
  divider: {
    backgroundColor: 'rgba(195,198,215,0.3)',
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
  },
  totalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  totalLabel: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontSize: 18,
  },
  totalValue: {
    ...typography.headlineSm,
    color: colors.primary,
    fontSize: 20,
  },
  footer: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
  },
  footerBtn: {
    flex: 1,
  },
});
