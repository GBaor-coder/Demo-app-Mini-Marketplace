import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState, MaterialIcons, ScreenHeader, toIconName } from '@/src/components/ui';
import { LocationPreview } from '@/src/components/location-preview';
import { useStore } from '@/src/context/store-context';
import { COD_FEE, PLATFORM_FEE } from '@/src/data/seed';
import { colors, radius, shadow } from '@/src/theme/colors';
import { CartLine, DeliveryMethod, Product } from '@/src/types';
import { distanceFromCenter } from '@/src/utils/filter';
import { distanceLabel, formatCurrency } from '@/src/utils/format';
import { openMapLink } from '@/src/utils/maps';

type SellerGroup = {
  sellerId: string;
  sellerName: string;
  items: { line: CartLine; product: Product }[];
};
export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ selectedId?: string }>();
  const { cart, products, addresses, getUserById, createOrders } = useStore();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null
  );
  const [deliveryMethods, setDeliveryMethods] = useState<Record<string, DeliveryMethod>>({});
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  useFocusEffect(
    useCallback(() => {
      const selectedId = params.selectedId;
      if (selectedId && addresses.some((a) => a.id === selectedId)) {
        setSelectedAddressId(selectedId);
      }
    }, [addresses, params.selectedId])

  );

  const groups = useMemo<SellerGroup[]>(() => {
    const map = new Map<string, SellerGroup>();
    cart
      .filter((line) => line.selected !== false)
      .forEach((line) => {
        const product = products.find((p) => p.id === line.productId);
        if (!product) return;
        const seller = getUserById(product.sellerId);
        const existing = map.get(product.sellerId);
        const item = { line, product };
        if (existing) {
          existing.items.push(item);
        } else {
          map.set(product.sellerId, {
            sellerId: product.sellerId,
            sellerName: seller?.name ?? 'Người bán',
            items: [item],
          });
        }
      });
    return Array.from(map.values());
  }, [cart, products, getUserById]);

  const lines = groups.flatMap((g) => g.items);
  const subtotal = lines.reduce((sum, { line, product }) => sum + line.quantity * product.price, 0);

  const allows = (sellerId: string, method: DeliveryMethod): boolean => {
    const g = groups.find((x) => x.sellerId === sellerId);
    if (!g) return false;
    return g.items.every(({ product }) =>
      method === 'meetup' ? product.allowsMeetup : product.allowsCod
    );
  };

  const methodFor = (sellerId: string): DeliveryMethod => {
    const current = deliveryMethods[sellerId];
    if (current === 'meetup' && allows(sellerId, 'meetup')) return 'meetup';
    if (current === 'cod' && allows(sellerId, 'cod')) return 'cod';
    if (allows(sellerId, 'meetup')) return 'meetup';
    if (allows(sellerId, 'cod')) return 'cod';
    return 'meetup';
  };

  const pickMethod = (sellerId: string, method: DeliveryMethod) => {
    if (!allows(sellerId, method)) return;
    setDeliveryMethods((prev) => ({ ...prev, [sellerId]: method }));
  };

  const shippingFee = groups.reduce(
    (sum, g) => sum + (methodFor(g.sellerId) === 'cod' ? COD_FEE : 0),
    0
  );
  const total = subtotal + shippingFee + PLATFORM_FEE;

  const placeOrder = async () => {
    if (lines.length === 0) return;
    const needsAddress = groups.some((g) => methodFor(g.sellerId) === 'cod');
    if (needsAddress && !selectedAddress) {
      Alert.alert('Chưa chọn địa chỉ', 'Vui lòng chọn địa chỉ nhận hàng trước khi đặt hàng.');
      return;
    }
    setPlacing(true);
    try {
      const methods = Object.fromEntries(groups.map((g) => [g.sellerId, methodFor(g.sellerId)]));
      const count = await createOrders(
        {
          latitude: selectedAddress?.location.latitude ?? 0,
          longitude: selectedAddress?.location.longitude ?? 0,
          address: selectedAddress?.location.address ?? '',
        },
        note,
        methods
      );
      if (count > 0) {
        router.replace('/order-success');
      } else {
        Alert.alert('Không thể đặt hàng', 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } finally {
      setPlacing(false);
    }
  };

  const emptyState = (
    <EmptyState
      icon={toIconName('cart_outline')}
      title="Chưa có sản phẩm để thanh toán"
      description="Thêm sản phẩm vào giỏ và chọn chúng để tiến hành đặt hàng."
    >
      <Button title="Đến giỏ hàng" onPress={() => router.replace('/cart')} />
    </EmptyState>
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Thanh toán" />

      {lines.length === 0 ? (
        emptyState
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/addresses?select=1')}
            style={styles.addressCard}>
            <MaterialIcons name="location-on" size={22} color={colors.primary} style={styles.addressIcon} />
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>Địa chỉ nhận hàng</Text>
              {selectedAddress ? (
                <>
                  <Text style={styles.addressLine1}>
                    {selectedAddress.recipient} | {selectedAddress.phone}
                  </Text>
                  <Text style={styles.addressLine2} numberOfLines={2}>
                    {selectedAddress.street}, {selectedAddress.ward}, {selectedAddress.district},{' '}
                    {selectedAddress.province}
                  </Text>
                  <View style={styles.addressMapWrap}>
                    <LocationPreview location={selectedAddress.location} />
                  </View>
                </>
              ) : (
                <Text style={styles.addressEmpty}>Chọn địa chỉ nhận hàng</Text>
              )}
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.outline} />
          </TouchableOpacity>

          {groups.map((group, groupIndex) => {
            const groupTotal =
              group.items.reduce(
                (sum, { line, product }) => sum + line.quantity * product.price,
                0
              ) + (methodFor(group.sellerId) === 'cod' ? COD_FEE : 0);
            const method = methodFor(group.sellerId);
            const canMeetup = allows(group.sellerId, 'meetup');
            const canCod = allows(group.sellerId, 'cod');
            return (
              <View key={group.sellerId} style={styles.sellerCard}>
                <View style={styles.sellerHeader}>
                  <MaterialIcons name="storefront" size={20} color={colors.onSurfaceVariant} />
                  <Text style={styles.sellerName}>{group.sellerName}</Text>
                </View>

                {group.items.map(({ line, product }) => (
                  <View key={line.productId} style={styles.productRow}>
                    <Image
                      contentFit="cover"
                      source={{ uri: product.images?.[0] || product.image }}
                      style={styles.thumb}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productTitle} numberOfLines={2}>
                        {product.title}
                      </Text>
                      <View style={styles.productMeta}>
                        <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
                        <Text style={styles.productQty}>x{line.quantity}</Text>
                      </View>
                    </View>
                  </View>
                ))}

                <View style={styles.deliveryBlock}>
                  <Text style={styles.deliveryTitle}>Phương thức nhận hàng</Text>
                  {canMeetup ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => pickMethod(group.sellerId, 'meetup')}
                      style={styles.deliveryRow}>
                      <View style={[styles.radio, method === 'meetup' && styles.radioActive]}>
                        {method === 'meetup' ? <View style={styles.radioDot} /> : null}
                      </View>
                      <View style={styles.deliveryInfo}>
                        <Text style={styles.deliveryName}>Gặp trực tiếp (FREE)</Text>
                        <Text style={styles.deliverySub}>
                          Hẹn gặp tại điểm giao dịch của người bán
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}
                  {canCod ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => pickMethod(group.sellerId, 'cod')}
                      style={styles.deliveryRow}>
                      <View style={[styles.radio, method === 'cod' && styles.radioActive]}>
                        {method === 'cod' ? <View style={styles.radioDot} /> : null}
                      </View>
                      <View style={styles.deliveryInfo}>
                        <Text style={styles.deliveryName}>Giao hàng COD</Text>
                        <Text style={styles.deliverySub}>
                          Phí ship: {formatCurrency(COD_FEE)} (Nội khu Làng Đại Học)
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}
                  {!canMeetup && !canCod ? (
                    <Text style={styles.deliveryUnavailable}>
                      Người bán chưa hỗ trợ phương thức nhận hàng cho sản phẩm này.
                    </Text>
                  ) : null}

                  {method === 'meetup' && group.items[0]?.product.location ? (
                    <View style={styles.meetupInfo}>
                      <View style={styles.meetupHeaderRow}>
                        <MaterialIcons name="storefront" size={18} color={colors.primary} />
                        <Text style={styles.meetupTitle}>
                          {group.items[0].product.meetupPoint || 'Điểm giao dịch của người bán'}
                        </Text>
                      </View>
                      <Text style={styles.meetupAddress} numberOfLines={2}>
                        {group.items[0].product.location.address}
                      </Text>
                      <View style={styles.meetupMetaRow}>
                        <Text style={styles.meetupDistance}>
                          Cách bạn khoảng{' '}
                          {distanceLabel(
                            distanceFromCenter(
                              group.items[0].product.location.latitude,
                              group.items[0].product.location.longitude
                            )
                          )}
                        </Text>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => {
                            const loc = group.items[0].product.location;
                            void openMapLink(loc.latitude, loc.longitude);
                          }}
                          style={styles.meetupMapBtn}>
                          <MaterialIcons name="map" size={15} color={colors.primary} />
                          <Text style={styles.meetupMapBtnText}>Xem bản đồ</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : null}

                  {method === 'cod' && selectedAddress ? (
                    <View style={styles.codRemind}>
                      <MaterialIcons name="local-shipping" size={18} color={colors.tertiary} />
                      <View style={styles.codRemindInfo}>
                        <Text style={styles.codRemindTitle}>Giao tận nơi đến:</Text>
                        <Text style={styles.codRemindLine}>
                          {selectedAddress.recipient} · {selectedAddress.phone}
                        </Text>
                        <Text style={[styles.codRemindLine, styles.codRemindAddress]} numberOfLines={2}>
                          {selectedAddress.street}, {selectedAddress.ward}, {selectedAddress.district}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {groupIndex === 0 ? (
                    <TextInput
                      value={note}
                      onChangeText={setNote}
                      placeholder="Lưu ý cho người bán..."
                      placeholderTextColor={colors.outline}
                      style={styles.noteInput}
                    />
                  ) : null}
                </View>

                <View style={styles.groupTotal}>
                  <Text style={styles.groupTotalLabel}>
                    Tổng số tiền ({group.items.length} sản phẩm):
                  </Text>
                  <Text style={styles.groupTotalValue}>{formatCurrency(groupTotal)}</Text>
                </View>
              </View>
            );
          })}

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeading}>
              <MaterialIcons name="receipt-long" size={20} color={colors.primary} />
              <Text style={styles.summaryTitle}>Chi tiết thanh toán</Text>
            </View>
            <View style={styles.summaryRows}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Tổng tiền hàng</Text>
                <Text style={styles.feeValue}>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Tổng phí vận chuyển</Text>
                <Text style={styles.feeValue}>
                  {shippingFee === 0 ? '0 ₫' : formatCurrency(shippingFee)}
                </Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={[styles.feeLabel, styles.feeDiscount]}>Giảm giá</Text>
                <Text style={[styles.feeValue, styles.feeDiscount]}>-0 ₫</Text>
              </View>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {lines.length > 0 ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.footerTotal}>
            <Text style={styles.footerTotalLabel}>Tổng thanh toán</Text>
            <Text style={styles.footerTotalValue}>{formatCurrency(total)}</Text>
          </View>
          <Button
            title={placing ? 'Đang đặt hàng...' : 'Đặt hàng'}
            loading={placing}
            onPress={placeOrder}
            style={styles.placeBtn}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  body: {
    padding: 20,
    paddingBottom: 32,
  },
  addressCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    padding: 16,
    ...shadow.level1,
  },
  addressIcon: {
    marginTop: 1,
  },
  addressInfo: {
    flex: 1,
    gap: 2,
  },
  addressLabel: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  addressLine1: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '500',
  },
  addressLine2: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  addressEmpty: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  addressMapWrap: {
    marginTop: 12,
  },
  sellerCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    marginBottom: 24,
    overflow: 'hidden',
    ...shadow.level1,
  },
  sellerHeader: {
    alignItems: 'center',
    borderBottomColor: 'rgba(195,198,215,0.2)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 16,
  },
  sellerName: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  productRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
  thumb: {
    borderRadius: radius.md,
    height: 80,
    width: 80,
  },
  productInfo: {
    flex: 1,
    gap: 6,
  },
  productTitle: {
    color: colors.onSurface,
    fontSize: 16,
    lineHeight: 22,
  },
  productMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productPrice: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  productQty: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
  },
  deliveryBlock: {
    backgroundColor: 'rgba(248,249,255,0.5)',
    borderTopColor: 'rgba(195,198,215,0.1)',
    borderTopWidth: 1,
    padding: 16,
  },
  deliveryTitle: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  deliveryUnavailable: {
    color: colors.error,
    fontSize: 13,
    lineHeight: 19,
  },
  deliveryRow: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  deliveryInfo: {
    flex: 1,
    gap: 1,
  },
  deliveryName: {
    color: colors.onSurface,
    fontSize: 16,
  },
  deliverySub: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
  },
  meetupInfo: {
    backgroundColor: 'rgba(0,74,198,0.05)',
    borderColor: 'rgba(0,74,198,0.15)',
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: 8,
    padding: 12,
  },
  meetupHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  meetupTitle: {
    color: colors.primary,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  meetupAddress: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  meetupMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  meetupDistance: {
    color: colors.onSurfaceVariant,
    flex: 1,
    fontSize: 13,
  },
  meetupMapBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  meetupMapBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  codRemind: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,98,41,0.06)',
    borderColor: 'rgba(0,98,41,0.15)',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    padding: 12,
  },
  codRemindInfo: {
    flex: 1,
    gap: 2,
  },
  codRemindTitle: {
    color: colors.tertiary,
    fontSize: 14,
    fontWeight: '700',
  },
  codRemindLine: {
    color: colors.onSurface,
    fontSize: 13,
  },
  codRemindAddress: {
    color: colors.onSurfaceVariant,
  },
  radio: {
    alignItems: 'center',
    borderColor: colors.outline,
    borderRadius: radius.full,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 10,
    width: 10,
  },
  noteInput: {
    backgroundColor: colors.surfaceBright,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: colors.onSurface,
    fontSize: 16,
    marginTop: 16,
    padding: 12,
  },
  groupTotal: {
    alignItems: 'center',
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  groupTotalLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
  },
  groupTotalValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    marginBottom: 24,
    padding: 16,
    ...shadow.level1,
  },
  summaryHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '600',
  },
  summaryRows: {
    borderBottomColor: 'rgba(195,198,215,0.2)',
    borderBottomWidth: 1,
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
  },
  feeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feeLabel: {
    color: colors.onSurface,
    fontSize: 16,
  },
  feeValue: {
    color: colors.onSurface,
    fontSize: 16,
  },
  feeDiscount: {
    color: colors.tertiary,
  },
  totalRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '500',
  },
  totalValue: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.94)',
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    ...shadow.level3,
  },
  footerTotal: {
    flex: 1,
  },
  footerTotalLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
  },
  footerTotalValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '600',
  },
  placeBtn: {
    minWidth: 130,
  },
});
