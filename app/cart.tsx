import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QuantityStepper } from '@/src/components/QuantityStepper';
import { Button, EmptyState, MaterialIcons } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { CartLine, Product } from '@/src/types';
import { formatCurrency } from '@/src/utils/format';

type SellerGroup = {
  sellerId: string;
  sellerName: string;
  sellerCampus: string;
  items: { line: CartLine; product: Product }[];
};

function Checkbox({
  checked,
  onPress,
  label,
}: {
  checked: boolean;
  onPress: () => void;
  label?: string;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.checkboxRow, label && styles.checkboxRowLabeled]}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <MaterialIcons name="check" size={12} color={colors.onPrimary} /> : null}
      </View>
      {label ? <Text style={styles.checkboxLabel}>{label}</Text> : null}
    </TouchableOpacity>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    cart,
    products,
    getUserById,
    selectAllCart,
    toggleCartSelected,
    changeCartQuantity,
    removeFromCart,
  } = useStore();

  const groups = useMemo<SellerGroup[]>(() => {
    const map = new Map<string, SellerGroup>();
    cart.forEach((line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product) return;
      const seller = getUserById(product.sellerId);
      const key = product.sellerId;
      const existing = map.get(key);
      const item = { line, product };
      if (existing) {
        existing.items.push(item);
      } else {
        map.set(key, {
          sellerId: key,
          sellerName: seller?.name ?? 'Người bán',
          sellerCampus: seller?.campus ?? '',
          items: [item],
        });
      }
    });
    return Array.from(map.values());
  }, [cart, products, getUserById]);

  const selectedLines = groups.flatMap((g) => g.items.filter(({ line }) => line.selected));
  const selectedCount = selectedLines.length;
  const total = selectedLines.reduce((sum, { line, product }) => sum + line.quantity * product.price, 0);
  const allSelected = selectedLines.length > 0 && selectedLines.length === cart.length;

  const checkout = () => {
    if (selectedCount === 0) {
      Alert.alert('Chưa chọn sản phẩm', 'Vui lòng chọn ít nhất một sản phẩm để đặt hàng.');
      return;
    }
    router.push('/checkout');
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Giỏ hàng</Text>
        <View style={styles.headerBtn} />
      </View>

      <FlatList
        data={groups}
        keyExtractor={(group) => group.sellerId}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="shopping-cart"
            title="Giỏ hàng của bạn còn trống"
            description="Thêm ngay những món đồ bạn thích vào giỏ để mua chúng nhé."
          >
            <Button title="Tiếp tục khám phá" onPress={() => router.replace('/(tabs)')} />
          </EmptyState>
        }
        renderItem={({ item: group }) => {
            const groupAll = group.items.length > 0 && group.items.every(({ line }) => line.selected);
            return (
              <View style={styles.sellerCard}>
                <View style={styles.sellerHeader}>
                  <Checkbox
                    checked={groupAll}
                    onPress={() =>
                      group.items.forEach(({ line }) => {
                        if (groupAll !== line.selected) toggleCartSelected(line.productId);
                      })
                    }
                  />
                  <MaterialIcons name="school" size={20} color={colors.outline} />
                  <Text numberOfLines={1} style={styles.sellerName}>
                    {group.sellerName} {group.sellerCampus ? `(${group.sellerCampus})` : ''}
                  </Text>
                </View>
                {group.items.map(({ line, product }, idx) => (
                  <View
                    key={line.productId}
                    style={[styles.item, idx > 0 && styles.itemDivider]}>
                    <Checkbox
                      checked={line.selected}
                      onPress={() => toggleCartSelected(line.productId)}
                    />
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => router.push(`/product/${product.id}`)}
                      style={styles.imageWrap}>
                       <Image source={{ uri: product.images?.[0] || product.image }} style={styles.image} contentFit="cover" />
                      <View style={[styles.conditionTag, conditionTagStyle(product.condition)]}>
                        <Text style={styles.conditionTagText}>{product.condition}</Text>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.info}>
                      <TouchableOpacity activeOpacity={0.85} onPress={() => router.push(`/product/${product.id}`)}>
                        <Text style={styles.name} numberOfLines={2}>
                          {product.title}
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.bottomRow}>
                        <View style={styles.priceCol}>
                          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
                          <Text style={styles.stockText}>Còn {product.stock}</Text>
                        </View>
                        <QuantityStepper
                          value={line.quantity}
                          max={product.stock}
                          onChange={(next) => changeCartQuantity(line.productId, next)}
                          onExceedMax={(max) =>
                            Alert.alert(
                              'Vượt quá số lượng tồn kho',
                              `Sản phẩm này chỉ còn ${max - line.quantity} trong kho. Vui lòng chọn số lượng nhỏ hơn.`
                            )
                          }
                        />
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert('Xóa sản phẩm', 'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?', [
                          { text: 'Hủy', style: 'cancel' },
                          { text: 'Xóa', style: 'destructive', onPress: () => removeFromCart(line.productId) },
                        ])
                      }
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.deleteBtn}>
                      <MaterialIcons name="delete" size={20} color={colors.outline} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            );
          }}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Checkbox checked={allSelected} onPress={() => selectAllCart(!allSelected)} label="Tất cả" />
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Tạm tính</Text>
          <Text style={styles.footerTotalValue}>{formatCurrency(total)}</Text>
        </View>
        <Button
          title={`Mua hàng (${selectedCount})`}
          disabled={selectedCount === 0}
          onPress={checkout}
          style={styles.checkoutBtn}
        />
      </View>
    </View>
  );
}

function conditionTagStyle(condition: string) {
  if (condition === 'Mới') {
    return { backgroundColor: colors.tertiary, borderColor: colors.tertiary };
  }
  if (condition === 'Như mới') {
    return { backgroundColor: colors.surfaceVariant, borderColor: colors.outlineVariant };
  }
  return { backgroundColor: colors.secondary, borderColor: colors.secondary };
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
    color: colors.primary,
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  checkboxRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  checkboxRowLabeled: {
    paddingVertical: 4,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.outline,
    borderRadius: 4,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkboxChecked: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  checkboxLabel: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  sellerCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    marginTop: 16,
    padding: 16,
    ...shadow.level1,
  },
  sellerHeader: {
    alignItems: 'center',
    borderBottomColor: 'rgba(195,198,215,0.3)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 8,
  },
  sellerName: {
    color: colors.onSurface,
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    gap: 16,
  },
  itemDivider: {
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopWidth: 1,
    paddingTop: 16,
  },
  imageWrap: {
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.md,
    borderWidth: 1,
    height: 80,
    overflow: 'hidden',
    position: 'relative',
    width: 80,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  conditionTag: {
    borderTopLeftRadius: radius.md,
    bottom: 0,
    borderWidth: 0,
    paddingHorizontal: 4,
    paddingVertical: 2,
    position: 'absolute',
    right: 0,
  },
  conditionTagText: {
    color: colors.onSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  info: {
    flex: 1,
    gap: 4,
    justifyContent: 'space-between',
    minHeight: 80,
    paddingTop: 2,
  },
  name: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  bottomRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  price: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  priceCol: {
    gap: 2,
  },
  stockText: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
  deleteBtn: {
    padding: 2,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  footer: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
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
    color: colors.outline,
    fontSize: 13,
  },
  footerTotalValue: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  checkoutBtn: {
    minWidth: 120,
  },
});
