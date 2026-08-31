import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/Avatar';
import { Button, EmptyState, IconName, MaterialIcons, ScreenHeader } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { formatCurrency, formatDateTime } from '@/src/utils/format';

type StepState = 'done' | 'current' | 'future' | 'error';

const STEP_LABELS = ['Đặt đơn', 'Chờ xác nhận', 'Giao dịch'];

export default function SellerOrderDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, products, getUserById, updateOrderStatus, startChat } = useStore();
  const [updating, setUpdating] = useState<string | null>(null);

  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);
  const buyer = order ? getUserById(order.buyerId) : undefined;

  const stepState = (step: number): StepState => {
    if (!order) return 'future';
    const s = order.status;
    if (s === 'completed') return 'done';
    if (s === 'rejected' || s === 'cancelled') {
      return step === 0 ? 'done' : step === 1 ? 'error' : 'future';
    }
    if (s === 'pending') return step === 0 ? 'done' : step === 1 ? 'current' : 'future';
    if (s === 'confirmed') return step === 2 ? 'current' : 'done';
    return step === 2 ? 'current' : 'done';
  };

  const stepSub = (step: number, state: StepState) => {
    if (!order) return '';
    if (step === 0) return formatDateTime(order.createdAt);
    if (step === 1) {
      if (state === 'current') return 'Đang chờ bạn xác nhận';
      if (state === 'error') {
        return (
          order.cancelReason ??
          (order.status === 'cancelled' ? 'Đơn hàng đã hủy' : 'Đơn hàng đã bị từ chối')
        );
      }
      return 'Đã xác nhận đơn';
    }
    if (state === 'current') {
      if (order.status === 'confirmed') return 'Đã xác nhận. Chạm "Bàn giao" để giao cho người mua.';
      if (order.status === 'in_transaction') return 'Đã bàn giao. Chờ người mua xác nhận nhận hàng.';
      return 'Đang tiến hành giao dịch';
    }
    if (state === 'done') return 'Đã hoàn tất';
    return '';
  };

  const renderStep = (step: number) => {
    const state = stepState(step);
    let circle: ViewStyle;
    let icon: IconName;
    let iconColor: string;
    let labelColor: string;
    let subColor: string;

    if (state === 'done') {
      circle = styles.dotDone;
      icon = 'check';
      iconColor = colors.onPrimary;
      labelColor = colors.onSurface;
      subColor = colors.onSurfaceVariant;
    } else if (state === 'current') {
      circle = styles.dotCurrent;
      icon = step === 1 ? 'pending-actions' : 'handshake';
      iconColor = colors.onPrimary;
      labelColor = colors.primaryContainer;
      subColor = 'rgba(37,99,235,0.8)';
    } else if (state === 'error') {
      circle = styles.dotError;
      icon = 'close';
      iconColor = colors.onErrorContainer;
      labelColor = colors.onErrorContainer;
      subColor = colors.onErrorContainer;
    } else {
      circle = styles.dotFuture;
      icon = step === 1 ? 'pending-actions' : 'handshake';
      iconColor = colors.onSurfaceVariant;
      labelColor = colors.onSurface;
      subColor = colors.onSurfaceVariant;
    }

    const sub = stepSub(step, state);
    return (
      <View key={step} style={[styles.stepRow, state === 'future' && styles.stepRowFuture]}>
        <View style={[styles.stepDot, circle]}>
          <MaterialIcons name={icon} size={14} color={iconColor} />
        </View>
        <View style={styles.stepInfo}>
          <Text style={[styles.stepLabel, { color: labelColor }]}>{STEP_LABELS[step]}</Text>
          {sub ? (
            <Text style={[styles.stepSub, { color: subColor }]}>{sub}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  if (!order) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Chi tiết đơn hàng" />
        <EmptyState icon="receipt-long" title="Không tìm thấy đơn hàng" />
      </View>
    );
  }

  const product = products.find((p) => p.id === order.items[0]?.productId);

  const runUpdate = (status: typeof order.status, label: string) => {
    setUpdating(status);
    setTimeout(() => {
      updateOrderStatus(order.id, status);
      setUpdating(null);
      Alert.alert(label, `Đơn hàng ${order.id} đã chuyển sang trạng thái ${label.toLowerCase()}.`);
    }, 400);
  };

  const confirmOrder = () => {
    Alert.alert('Xác nhận đơn hàng', 'Xác nhận đơn và bắt đầu chuẩn bị hàng cho người mua?', [
      { text: 'Để sau', style: 'cancel' },
      { text: 'Xác nhận', onPress: () => runUpdate('confirmed', 'Đã xác nhận') },
    ]);
  };

  const rejectOrder = () => {
    Alert.alert(
      'Từ chối đơn hàng',
      'Bạn sẽ phải chọn lý do khi từ chối. Xác nhận từ chối đơn này?',
      [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Từ chối', style: 'destructive', onPress: () => router.push(`/order-cancel?id=${order.id}&seller=1`) },
      ]
    );
  };

  const canConfirm = order.status === 'pending';
  const canReject = ['pending', 'confirmed'].includes(order.status);
  const canDeliver = order.status === 'confirmed';

  const openChat = async () => {
    const threadId = await startChat(order.buyerId, product?.id ?? undefined);
    if (threadId) {
      router.push(`/chat/${threadId}`);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title={`#${order.id}`} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>TRẠNG THÁI</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineLine} />
            {[0, 1, 2].map(renderStep)}
          </View>
        </View>

        {buyer ? (
          <View style={styles.buyerCard}>
            <Avatar uri={buyer.avatar} name={buyer.name} size={56} />
            <View style={styles.buyerInfo}>
              <Text style={styles.buyerName}>{buyer.name}</Text>
              <View style={styles.buyerMetaRow}>
                <MaterialIcons name="school" size={14} color={colors.onSurfaceVariant} />
                <Text style={styles.buyerMeta} numberOfLines={1}>
                  {buyer.campus}
                </Text>
              </View>
              {buyer.rating ? (
                <View style={styles.ratingRow}>
                  <MaterialIcons name="star" size={16} color={colors.star} />
                  <Text style={styles.ratingValue}>{buyer.rating.toFixed(1)}</Text>
                  <Text style={styles.ratingCount}>({buyer.reviewCount ?? 0} đánh giá)</Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity onPress={openChat} style={styles.chatIcon}>
              <MaterialIcons name="chat" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>SẢN PHẨM</Text>
          {order.items.map((item, index) => (
            <TouchableOpacity
              key={`${item.productId}-${index}`}
              activeOpacity={0.85}
              onPress={() => router.push(`/product/${item.productId}`)}
              style={[styles.itemRow, index > 0 && styles.itemDivider]}>
              <Image
                source={{ uri: item.image || product?.images[0] || product?.image }}
                style={styles.itemImage}
                contentFit="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.condition ? (
                  <Text style={styles.itemMeta}>Điều kiện: {item.condition}</Text>
                ) : null}
                <View style={styles.itemBottom}>
                  <Text style={styles.itemQty}>x{item.quantity}</Text>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>THANH TOÁN</Text>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Tạm tính</Text>
            <Text style={styles.feeValue}>
              {formatCurrency(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0))}
            </Text>
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
            <Text style={styles.totalLabel}>Người mua thanh toán</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Bạn nhận về (dự kiến)</Text>
            <Text style={styles.payoutValue}>
              {formatCurrency(order.total - order.platformFee)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>THÔNG TIN GIAO HÀNG</Text>
          <View style={styles.deliveryRow}>
            <MaterialIcons name="location-on" size={20} color={colors.primaryContainer} />
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryLabel}>
                {order.deliveryMethod === 'meetup' ? 'Gặp mặt trực tiếp' : 'Giao tận nơi (COD)'}
              </Text>
              <Text style={styles.deliveryValue} numberOfLines={2}>
                {order.deliveryLocation.address}
              </Text>
            </View>
          </View>
          <View style={styles.mapBox}>
            <MaterialIcons name="map" size={44} color={colors.outlineVariant} />
          </View>
          {order.note ? (
            <View style={styles.deliveryRow}>
              <MaterialIcons name="description" size={20} color={colors.primaryContainer} />
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryLabel}>Ghi chú người mua</Text>
                <Text style={styles.deliveryValue}>{order.note}</Text>
              </View>
            </View>
          ) : null}
          <View style={styles.deliveryRow}>
            <MaterialIcons name="schedule" size={20} color={colors.primaryContainer} />
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryLabel}>Thời gian đặt</Text>
              <Text style={[styles.deliveryValue, styles.deliveryTime]}>
                {formatDateTime(order.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {canReject ? (
          <Button title="Từ chối" variant="tonal" onPress={rejectOrder} style={styles.footerBtn} />
        ) : null}
        {canConfirm ? (
          <Button
            title="Xác nhận đơn"
            loading={updating === 'confirmed'}
            onPress={confirmOrder}
            style={styles.footerBtn}
          />
        ) : null}
        {canDeliver ? (
          <Button
            title="Bàn giao cho người mua"
            loading={updating === 'in_transaction'}
            onPress={() => runUpdate('in_transaction', 'Đang giao dịch')}
            style={styles.footerBtn}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  body: {
    gap: 24,
    padding: 20,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.2)',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 16,
    ...shadow.level1,
  },
  sectionLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  timeline: {
    gap: 16,
    position: 'relative',
  },
  timelineLine: {
    backgroundColor: 'rgba(195,198,215,0.3)',
    bottom: 16,
    left: 11,
    position: 'absolute',
    top: 16,
    width: 2,
  },
  stepRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    zIndex: 1,
  },
  stepRowFuture: {
    opacity: 0.5,
  },
  stepDot: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 24,
    justifyContent: 'center',
    marginTop: 2,
    width: 24,
    zIndex: 1,
  },
  dotDone: {
    backgroundColor: colors.primary,
  },
  dotCurrent: {
    backgroundColor: colors.primaryContainer,
    elevation: 3,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dotError: {
    backgroundColor: colors.errorContainer,
  },
  dotFuture: {
    backgroundColor: colors.surfaceVariant,
    borderColor: colors.outlineVariant,
    borderWidth: 1,
  },
  stepInfo: {
    flex: 1,
    gap: 1,
  },
  stepLabel: {
    ...typography.bodyMd,
    fontWeight: '500',
  },
  stepSub: {
    ...typography.bodySm,
  },
  buyerCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.2)',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    ...shadow.level1,
  },
  buyerInfo: {
    flex: 1,
    gap: 2,
  },
  buyerName: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: '600',
  },
  buyerMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  buyerMeta: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  ratingValue: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  ratingCount: {
    ...typography.bodySm,
    color: colors.outline,
  },
  chatIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderColor: 'rgba(0,74,198,0.22)',
    borderRadius: radius.full,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  itemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 8,
  },
  itemDivider: {
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopWidth: 1,
  },
  itemImage: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.md,
    height: 80,
    width: 80,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: '500',
  },
  itemMeta: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  itemBottom: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  itemQty: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  itemPrice: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: '600',
  },
  feeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  feeLabel: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  feeValue: {
    ...typography.bodySm,
    color: colors.onSurface,
  },
  divider: {
    backgroundColor: colors.outlineVariant,
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  totalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  totalValue: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  payoutValue: {
    ...typography.headlineSm,
    color: colors.primary,
  },
  deliveryRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 6,
  },
  deliveryInfo: {
    flex: 1,
    gap: 2,
  },
  deliveryLabel: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: '500',
  },
  deliveryValue: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  deliveryTime: {
    color: colors.primary,
    fontWeight: '500',
  },
  mapBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceDim,
    borderColor: 'rgba(195,198,215,0.1)',
    borderRadius: radius.md,
    borderWidth: 1,
    height: 128,
    justifyContent: 'center',
    marginTop: 12,
    overflow: 'hidden',
  },
  footer: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
  },
  footerBtn: {
    flex: 1,
  },
});
