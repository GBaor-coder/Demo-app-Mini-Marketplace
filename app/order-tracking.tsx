import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/Avatar';
import { LocationPreview } from '@/src/components/location-preview';
import { Button, EmptyState, StatusBadge } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { OrderStatus } from '@/src/types';
import { formatCurrency } from '@/src/utils/format';

type Step = {
  key: OrderStatus | 'placed';
  title: string;
  description: string;
};

const STEPS: Step[] = [
  { key: 'placed', title: 'Đặt hàng thành công', description: 'Đơn hàng đã được ghi nhận.' },
  { key: 'pending', title: 'Chờ người bán xác nhận', description: 'Người bán sẽ xác nhận đơn trong thời gian sớm nhất.' },
  { key: 'confirmed', title: 'Đã xác nhận đơn hàng', description: 'Đơn hàng đã sẵn sàng để giao dịch.' },
  { key: 'in_transaction', title: 'Đang giao đến điểm hẹn', description: 'Người bán đang trên đường đến điểm hẹn.' },
  { key: 'completed', title: 'Hoàn tất giao dịch', description: 'Đơn hàng đã được giao thành công.' },
];

const STEP_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  placed: 'receipt-outline',
  pending: 'time-outline',
  confirmed: 'checkmark-circle-outline',
  in_transaction: 'cube-outline',
  completed: 'flag-outline',
};

const CANCEL_INDEX = 2;

export default function OrderTrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, getUserById, startChat } = useStore();

  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);
  const seller = order ? getUserById(order.sellerId) : undefined;

  if (!order) {
    return (
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.title}>Theo dõi đơn hàng</Text>
          <View style={styles.headerBtn} />
        </View>
        <EmptyState icon="location-outline" title="Không tìm thấy đơn hàng" />
      </View>
    );
  }

  const cancelled = order.status === 'cancelled' || order.status === 'rejected';
  const statusIndex = cancelled ? CANCEL_INDEX : STEPS.findIndex((s) => s.key === order.status);
  const displayIndex = cancelled ? -1 : STEPS.length - 1 - statusIndex;
  const firstItem = order.items[0];
  const chat = () => {
    const thread = startChat(order.sellerId, order.items[0]?.productId ?? '');
    router.push(`/chat/${thread}`);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Theo dõi đơn hàng</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <Text style={styles.orderId}>Mã đơn: {order.id}</Text>
            <StatusBadge status={order.status} size="sm" />
          </View>
          <View style={styles.productRow}>
            {firstItem ? (
              <>
                <Image source={{ uri: firstItem.image }} style={styles.thumb} />
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {firstItem.title}
                  </Text>
                  <Text style={styles.sellerMeta}>Người bán: {seller?.name ?? 'Người bán'}</Text>
                  <Text style={styles.productPrice}>
                    {formatCurrency(firstItem.price * firstItem.quantity)}
                  </Text>
                </View>
              </>
            ) : null}
          </View>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.cardTitle}>Trạng thái giao hàng</Text>
          <View style={styles.timeline}>
            {cancelled ? (
              <View style={styles.stepRow}>
                <View style={[styles.dot, styles.dotCancelled]}>
                  <Ionicons name="close" size={14} color={colors.error} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, styles.stepTitleCancelled]}>
                    Đơn hàng đã {order.status === 'rejected' ? 'bị từ chối' : 'bị hủy'}
                  </Text>
                  {order.cancelReason ? (
                    <Text style={styles.stepDesc}>Lý do: {order.cancelReason}</Text>
                  ) : null}
                </View>
              </View>
            ) : (
              [...STEPS].reverse().map((step, index) => {
                const active = index === displayIndex;
                const done = index > displayIndex;
                const future = index < displayIndex;
                return (
                  <View key={step.key} style={styles.stepRow}>
                    <View style={styles.timelineColumn}>
                      <View
                        style={[
                          styles.dot,
                          done && styles.dotDone,
                          active && styles.dotActive,
                          future && styles.dotFuture,
                        ]}>
                        {done ? (
                          <Ionicons name="checkmark" size={14} color={colors.onTertiary} />
                        ) : active ? (
                          <Ionicons
                            name={STEP_ICONS[step.key] ?? 'ellipse'}
                            size={13}
                            color={colors.onPrimary}
                          />
                        ) : null}
                      </View>
                      {index < STEPS.length - 1 ? (
                        <View
                          style={[
                            styles.line,
                            (done || active) && styles.lineDone,
                            index < displayIndex && styles.lineFuture,
                          ]}
                        />
                      ) : null}
                    </View>
                    <View style={[styles.stepContent, future && styles.stepFuture]}>
                      <Text
                        style={[
                          styles.stepTitle,
                          active && styles.stepTitleActive,
                          future && styles.stepTitleFuture,
                        ]}>
                        {step.title}
                      </Text>
                      {active ? (
                        <View style={styles.infoBox}>
                          <Ionicons name="information-circle" size={18} color={colors.primary} />
                          <Text style={styles.infoText}>{step.description}</Text>
                        </View>
                      ) : (
                        <Text style={styles.stepDesc}>{step.description}</Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View style={styles.meetupCard}>
          <View style={styles.meetupHeader}>
            <Text style={styles.cardTitle}>Điểm hẹn giao dịch</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationAddress} numberOfLines={2}>
                  {order.deliveryLocation.address}
                </Text>
                {seller?.campus ? (
                  <Text style={styles.locationCampus}>{seller.campus}</Text>
                ) : null}
              </View>
            </View>
          </View>
          <View style={styles.mapWrap}>
            <LocationPreview location={order.deliveryLocation} />
          </View>
          <View style={styles.sellerRow}>
            <Avatar uri={seller?.avatar} name={seller?.name} size={40} />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName} numberOfLines={1}>
                {seller?.name ?? 'Người bán'}
              </Text>
              {seller?.rating != null ? (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color={colors.star} />
                  <Text style={styles.ratingText}>
                    {seller.rating.toFixed(1)} ({seller.reviewCount ?? 0} đánh giá)
                  </Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity activeOpacity={0.85} onPress={chat} style={styles.chatBtn}>
              <Ionicons name="chatbubble-ellipses-outline" size={19} color={colors.onSecondaryContainer} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Hủy đơn"
            variant="outline"
            onPress={() => router.push(`/order-cancel?id=${order.id}`)}
            style={styles.actionBtn}
          />
          <Button
            title="Liên hệ người bán"
            onPress={chat}
            style={[styles.actionBtn, styles.contactBtn]}
          />
        </View>
        <View style={styles.spacer} />
      </ScrollView>
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
  summaryCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
    gap: 12,
    padding: 16,
    ...shadow.level1,
  },
  summaryTop: {
    alignItems: 'center',
    borderBottomColor: 'rgba(195,198,215,0.3)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  orderId: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
  },
  productRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    paddingTop: 4,
  },
  thumb: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.lg,
    height: 64,
    width: 64,
  },
  productInfo: {
    flex: 1,
    gap: 3,
  },
  productTitle: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: '600',
  },
  sellerMeta: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
  },
  productPrice: {
    ...typography.headlineSm,
    color: colors.primary,
    fontSize: 18,
  },
  timelineCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
    padding: 16,
    ...shadow.level1,
  },
  cardTitle: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: '600',
  },
  timeline: {
    marginTop: 18,
  },
  stepRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    minHeight: 78,
  },
  timelineColumn: {
    alignItems: 'center',
    alignSelf: 'stretch',
    width: 30,
  },
  dot: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderColor: colors.outlineVariant,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    marginTop: 1,
    width: 24,
  },
  dotDone: {
    backgroundColor: colors.tertiary,
    borderColor: colors.tertiary,
  },
  dotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  dotFuture: {
    backgroundColor: colors.surfaceContainerHigh,
    borderColor: colors.outlineVariant,
  },
  dotCancelled: {
    backgroundColor: colors.errorContainer,
    borderColor: colors.errorContainer,
  },
  line: {
    backgroundColor: 'rgba(195,198,215,0.4)',
    flex: 1,
    marginVertical: 3,
    width: 2,
  },
  lineDone: {
    backgroundColor: colors.tertiary,
  },
  lineFuture: {
    backgroundColor: 'rgba(195,198,215,0.4)',
  },
  stepContent: {
    flex: 1,
    paddingBottom: 22,
    paddingTop: 2,
  },
  stepFuture: {
    opacity: 0.55,
  },
  stepTitle: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: '500',
  },
  stepTitleActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  stepTitleFuture: {
    color: colors.onSurfaceVariant,
  },
  stepTitleCancelled: {
    color: colors.error,
  },
  stepDesc: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  infoBox: {
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    padding: 10,
  },
  infoText: {
    color: colors.onSurfaceVariant,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  meetupCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    ...shadow.level1,
  },
  meetupHeader: {
    borderBottomColor: 'rgba(195,198,215,0.3)',
    borderBottomWidth: 1,
    gap: 10,
    padding: 16,
  },
  locationRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  locationInfo: {
    flex: 1,
    gap: 2,
  },
  locationAddress: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: '500',
  },
  locationCampus: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
  },
  mapWrap: {
    padding: 16,
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
    fontWeight: '600',
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  ratingText: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
  },
  chatBtn: {
    alignItems: 'center',
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
  },
  contactBtn: {
    backgroundColor: colors.primaryContainer,
  },
  spacer: {
    height: 8,
  },
});
