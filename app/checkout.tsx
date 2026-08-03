import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocationPicker } from '@/src/components/location-picker';
import { FormField, PrimaryButton, SectionHeading } from '@/src/components/ui';
import { DEFAULT_LOCATION } from '@/src/data/seed';
import { useStore } from '@/src/context/store-context';
import { colors } from '@/src/theme/colors';
import { DeliveryMethod } from '@/src/types';
import { formatCurrency } from '@/src/utils/format';

export default function CheckoutScreen() {
  const { currentUser, cart, products, createOrders } = useStore();
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('meetup');
  const [note, setNote] = useState('');

  const lines = useMemo(
    () =>
      cart.flatMap((line) => {
        const product = products.find((item) => item.id === line.productId);
        return product ? [{ ...line, product }] : [];
      }),
    [cart, products]
  );
  const subtotal = lines.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const sellerCount = new Set(lines.map((item) => item.product.sellerId)).size;
  const shippingFee = deliveryMethod === 'cod' ? 20000 * sellerCount : 0;
  const total = subtotal + shippingFee;

  if (currentUser?.role !== 'buyer') {
    return <Redirect href="/(tabs)" />;
  }
  if (lines.length === 0) {
    return <Redirect href="/cart" />;
  }

  function handlePlaceOrder() {
    const created = createOrders(location, note, deliveryMethod);
    if (created === 0) {
      Alert.alert('Không thể đặt hàng', 'Sản phẩm có thể đã hết. Vui lòng kiểm tra lại giỏ hàng.');
      return;
    }

    Alert.alert(
      'Đặt hàng thành công',
      created > 1
        ? `Giỏ hàng được tách thành ${created} đơn theo từng người bán.`
        : 'Người bán sẽ sớm xác nhận đơn của bạn.',
      [{ text: 'Xem đơn mua', onPress: () => router.replace('/(tabs)/orders') }]
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Quay lại" onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Xác nhận đặt hàng</Text>
          <Text style={styles.subtitle}>Kiểm tra sản phẩm và vị trí nhận</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <SectionHeading title="Sản phẩm" />
          {lines.map((line) => (
            <View key={line.productId} style={styles.orderItem}>
              <Image contentFit="cover" source={{ uri: line.product.image }} style={styles.image} />
              <View style={styles.itemBody}>
                <Text numberOfLines={2} style={styles.itemTitle}>
                  {line.product.title}
                </Text>
                <Text style={styles.itemMeta}>Số lượng: {line.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                {formatCurrency(line.product.price * line.quantity)}
              </Text>
            </View>
          ))}

          <View style={styles.sectionGap} />
          <SectionHeading title="Hình thức nhận hàng" />
          <View style={styles.deliveryRow}>
            <DeliveryOption
              active={deliveryMethod === 'meetup'}
              description="Hẹn gặp tại điểm đã chọn"
              icon="people-outline"
              onPress={() => setDeliveryMethod('meetup')}
              title="Nhận trực tiếp"
            />
            <DeliveryOption
              active={deliveryMethod === 'cod'}
              description="Phí 20.000đ/người bán"
              icon="bicycle-outline"
              onPress={() => setDeliveryMethod('cod')}
              title="Giao COD"
            />
          </View>

          <LocationPicker
            onChange={setLocation}
            title={deliveryMethod === 'meetup' ? 'Điểm hẹn nhận hàng' : 'Địa chỉ giao hàng'}
            value={location}
          />

          <FormField
            label="Ghi chú cho người bán"
            maxLength={180}
            multiline
            onChangeText={setNote}
            placeholder="Ví dụ: Mình nhận sau 17 giờ, gọi trước khi đến..."
            value={note}
          />

          <View style={styles.paymentSummary}>
            <SummaryRow label="Tiền sản phẩm" value={formatCurrency(subtotal)} />
            <SummaryRow label="Phí giao hàng" value={formatCurrency(shippingFee)} />
            <View style={styles.summaryDivider} />
            <SummaryRow bold label="Tổng thanh toán" value={formatCurrency(total)} />
          </View>

          <PrimaryButton
            icon="checkmark-circle-outline"
            onPress={handlePlaceOrder}
            title={`Đặt hàng • ${formatCurrency(total)}`}
          />
          <Text style={styles.secureNote}>
            Không thanh toán trực tuyến. Hãy kiểm tra sản phẩm trước khi nhận trực tiếp.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DeliveryOption({
  active,
  description,
  icon,
  onPress,
  title,
}: {
  active: boolean;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  title: string;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.deliveryOption, active && styles.deliveryOptionActive]}>
      <Ionicons name={icon} size={22} color={active ? colors.white : colors.primary} />
      <Text style={[styles.deliveryTitle, active && styles.deliveryTitleActive]}>{title}</Text>
      <Text style={[styles.deliveryDescription, active && styles.deliveryDescriptionActive]}>
        {description}
      </Text>
    </TouchableOpacity>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.summaryLabelBold]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.summaryValueBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  flex: { flex: 1 },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerText: { flex: 1 },
  title: { color: colors.ink, fontSize: 19, fontWeight: '900' },
  subtitle: { color: colors.inkMuted, fontSize: 12, marginTop: 2 },
  content: { padding: 18, paddingBottom: 40 },
  orderItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 78,
    paddingVertical: 10,
  },
  image: { backgroundColor: colors.primarySoft, borderRadius: 6, height: 58, width: 58 },
  itemBody: { flex: 1 },
  itemTitle: { color: colors.ink, fontSize: 13, fontWeight: '700', lineHeight: 18 },
  itemMeta: { color: colors.inkMuted, fontSize: 11, marginTop: 4 },
  itemPrice: { color: colors.accent, fontSize: 13, fontWeight: '900' },
  sectionGap: { height: 25 },
  deliveryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  deliveryOption: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 116,
    padding: 13,
  },
  deliveryOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  deliveryTitle: { color: colors.ink, fontSize: 13, fontWeight: '800', marginTop: 9 },
  deliveryTitleActive: { color: colors.white },
  deliveryDescription: { color: colors.inkMuted, fontSize: 11, lineHeight: 16, marginTop: 4 },
  deliveryDescriptionActive: { color: 'rgba(255,255,255,0.78)' },
  paymentSummary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    marginBottom: 14,
    marginTop: 5,
    padding: 15,
  },
  summaryRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: colors.inkMuted, fontSize: 13 },
  summaryValue: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  summaryDivider: { backgroundColor: colors.border, height: 1 },
  summaryLabelBold: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  summaryValueBold: { color: colors.accent, fontSize: 18, fontWeight: '900' },
  secureNote: {
    color: colors.inkMuted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
    textAlign: 'center',
  },
});
