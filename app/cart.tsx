import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, PrimaryButton } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, shadow } from '@/src/theme/colors';
import { formatCurrency } from '@/src/utils/format';

export default function CartScreen() {
  const { cart, products, changeCartQuantity, removeFromCart } = useStore();
  const lines = cart.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId);
    return product ? [{ ...line, product }] : [];
  });
  const total = lines.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Quay lại" onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Giỏ hàng</Text>
          <Text style={styles.subtitle}>{lines.length} sản phẩm đã chọn</Text>
        </View>
      </View>

      {lines.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            description="Khám phá các món đồ tốt quanh trường và thêm vào đây."
            icon="bag-handle-outline"
            title="Giỏ hàng đang trống"
          />
          <PrimaryButton
            onPress={() => router.replace('/(tabs)')}
            style={styles.exploreButton}
            title="Tiếp tục khám phá"
          />
        </View>
      ) : (
        <>
          <FlatList
            contentContainerStyle={styles.list}
            data={lines}
            keyExtractor={(item) => item.productId}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Image contentFit="cover" source={{ uri: item.product.image }} style={styles.image} />
                <View style={styles.itemBody}>
                  <View style={styles.itemTop}>
                    <Text numberOfLines={2} style={styles.itemTitle}>
                      {item.product.title}
                    </Text>
                    <TouchableOpacity
                      accessibilityLabel="Xóa khỏi giỏ"
                      onPress={() => removeFromCart(item.productId)}
                      style={styles.deleteButton}>
                      <Ionicons name="trash-outline" size={17} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.itemPrice}>{formatCurrency(item.product.price)}</Text>
                  <View style={styles.quantityRow}>
                    <Text style={styles.stock}>Kho: {item.product.stock}</Text>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        accessibilityLabel="Giảm số lượng"
                        onPress={() => changeCartQuantity(item.productId, item.quantity - 1)}
                        style={styles.stepperButton}>
                        <Ionicons name="remove" size={17} color={colors.ink} />
                      </TouchableOpacity>
                      <Text style={styles.quantity}>{item.quantity}</Text>
                      <TouchableOpacity
                        accessibilityLabel="Tăng số lượng"
                        disabled={item.quantity >= item.product.stock}
                        onPress={() => changeCartQuantity(item.productId, item.quantity + 1)}
                        style={[
                          styles.stepperButton,
                          item.quantity >= item.product.stock && styles.stepperDisabled,
                        ]}>
                        <Ionicons name="add" size={17} color={colors.ink} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.summaryBar}>
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryTotal}>{formatCurrency(total)}</Text>
            </View>
            <PrimaryButton
              icon="arrow-forward"
              onPress={() => router.push('/checkout')}
              style={styles.checkoutButton}
              title="Thanh toán"
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
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
  title: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  subtitle: { color: colors.inkMuted, fontSize: 12, marginTop: 2 },
  emptyWrap: { flex: 1, justifyContent: 'center', padding: 22 },
  exploreButton: { alignSelf: 'center', minWidth: 210 },
  list: { padding: 16, paddingBottom: 126 },
  cartItem: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 11,
    overflow: 'hidden',
    ...shadow,
  },
  image: { backgroundColor: colors.primarySoft, height: 132, width: 116 },
  itemBody: { flex: 1, padding: 11 },
  itemTop: { alignItems: 'flex-start', flexDirection: 'row', gap: 5 },
  itemTitle: { color: colors.ink, flex: 1, fontSize: 14, fontWeight: '800', lineHeight: 19 },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: 6,
    height: 31,
    justifyContent: 'center',
    width: 31,
  },
  itemPrice: { color: colors.accent, fontSize: 15, fontWeight: '900', marginTop: 7 },
  quantityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  stock: { color: colors.inkMuted, fontSize: 11 },
  stepper: {
    alignItems: 'center',
    borderColor: colors.borderStrong,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    height: 34,
  },
  stepperButton: { alignItems: 'center', height: 32, justifyContent: 'center', width: 34 },
  stepperDisabled: { opacity: 0.35 },
  quantity: {
    borderLeftColor: colors.borderStrong,
    borderLeftWidth: 1,
    borderRightColor: colors.borderStrong,
    borderRightWidth: 1,
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
    minWidth: 34,
    paddingVertical: 7,
    textAlign: 'center',
  },
  summaryBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: 14,
    left: 0,
    padding: 14,
    position: 'absolute',
    right: 0,
    ...shadow,
  },
  summaryText: { minWidth: 118 },
  summaryLabel: { color: colors.inkMuted, fontSize: 12 },
  summaryTotal: { color: colors.accent, fontSize: 19, fontWeight: '900', marginTop: 3 },
  checkoutButton: { flex: 1 },
});
