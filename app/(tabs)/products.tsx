import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, EmptyState, MaterialIcons, ScreenHeader } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { Product } from '@/src/types';
import { formatCurrency, getProductStatusLabel } from '@/src/utils/format';

type FilterTab = 'active' | 'out';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'active', label: 'Đang bán' },
  { key: 'out', label: 'Hết hàng' },
];

function productImageUri(product: Product): string | null {
  if (Array.isArray(product.images)) {
    const first = product.images.find(
      (uri) => typeof uri === 'string' && uri.trim().length > 0
    );
    if (first) {
      return first;
    }
  }
  if (typeof product.image === 'string' && product.image.trim().length > 0) {
    return product.image;
  }
  return null;
}

function badgeStyle(label: string) {
  if (label === 'ĐÃ BÁN') {
    return { backgroundColor: 'rgba(11,28,48,0.85)' };
  }
  if (label === 'HẾT HÀNG') {
    return { backgroundColor: colors.error };
  }
  return { backgroundColor: colors.tertiary };
}

export default function SellerProductsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, products, deleteProduct, loadMyProducts } = useStore();
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>('active');

  useEffect(() => {
    if (currentUser) {
      void loadMyProducts();
    }
  }, [currentUser, loadMyProducts]);

  const myProducts = useMemo(() => {
    if (!currentUser) return [];
    return products.filter(
      (p) => p.sellerId === currentUser.id && p.status !== 'draft'
    );
  }, [currentUser, products]);

  const counts = useMemo(() => {
    return {
      active: myProducts.filter((p) => p.status === 'active' && p.stock > 0).length,
      out: myProducts.filter(
        (p) => p.status === 'sold' || (p.status === 'active' && p.stock <= 0)
      ).length,
    };
  }, [myProducts]);

  const filtered = useMemo(() => {
    if (filterTab === 'out') {
      return myProducts.filter(
        (p) => p.status === 'sold' || (p.status === 'active' && p.stock <= 0)
      );
    }
    return myProducts.filter((p) => p.status === 'active' && p.stock > 0);
  }, [myProducts, filterTab]);

  const totalInventoryValue = useMemo(
    () =>
      myProducts
        .filter((p) => p.status === 'active' && p.stock > 0)
        .reduce((sum, p) => sum + p.price * p.stock, 0),
    [myProducts]
  );

  const openMenu = (item: Product) => {
    Alert.alert(item.title, undefined, [
      { text: 'Sửa sản phẩm', onPress: () => router.push(`/product-form?id=${item.id}`) },
      { text: 'Xóa sản phẩm', style: 'destructive', onPress: () => setDeleting(item) },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const renderItem = ({ item }: { item: Product }) => {
    const imageUri = productImageUri(item);
    const label = getProductStatusLabel(item);
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/product-preview?id=${item.id}`)}
        style={styles.card}>
        <View style={styles.imageWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialIcons name="image" size={40} color={colors.onSurfaceVariant} />
            </View>
          )}
          <View style={[styles.statusBadge, badgeStyle(label)]}>
            <Text style={styles.statusBadgeText}>{label}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => openMenu(item)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={styles.menuBtn}>
            <MaterialIcons name="more-vert" size={20} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
        <View style={styles.cardBody}>
          <Text numberOfLines={2} style={styles.itemTitle}>
            {item.title}
          </Text>
          <Text style={styles.price}>{formatCurrency(item.price)}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.stockRow}>
              <MaterialIcons name="inventory-2" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.stockText}>Tồn kho: {item.stock}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => router.push(`/product-form?id=${item.id}`)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.actionBtn}>
                <MaterialIcons name="edit" size={18} color={colors.secondary} />
              </TouchableOpacity>
              {item.stock <= 0 ? (
                <TouchableOpacity
                  onPress={() => router.push(`/product-form?republish=${item.id}`)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.actionBtn}
                  accessibilityLabel="Đăng lại sản phẩm">
                  <MaterialIcons name="refresh" size={18} color={colors.primary} />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={() => setDeleting(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.actionBtn}>
                <MaterialIcons name="delete" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Quản lý sản phẩm" showBack={false} />

      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {FILTER_TABS.map((item) => {
            const count = counts[item.key];
            const selected = filterTab === item.key;
            return (
              <View key={item.key} style={styles.chipWrap}>
                <Chip
                  label={`${item.label} (${count})`}
                  selected={selected}
                  onPress={() => setFilterTab(item.key)}
                />
              </View>
            );
          })}
        </ScrollView>
      </View>

      {filterTab === 'active' && counts.active > 0 ? (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Tổng quan</Text>
          <Text style={styles.statsValue}>
            {counts.active} đang bán · {formatCurrency(totalInventoryValue)} giá trị tồn
          </Text>
          <Text style={styles.statsHint}>
            Sản phẩm đã bán xem tại mục Đơn hàng.
          </Text>
        </View>
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 96 }]}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="sell"
            title={
              filterTab === 'out'
                ? 'Không có sản phẩm hết hàng hoặc đã bán'
                : 'Chưa có sản phẩm'
            }
            description={
              filterTab === 'active'
                ? 'Đăng tin bán sản phẩm đầu tiên của bạn để bắt đầu.'
                : 'Sản phẩm sẽ xuất hiện ở đây khi tạm hết hàng hoặc đã hoàn tất giao dịch.'
            }
          >
            {filterTab === 'active' ? (
              <Button title="Đăng sản phẩm" icon="add" onPress={() => router.push('/product-form')} />
            ) : null}
          </EmptyState>
        }
      />

      <View style={[styles.fab, { bottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/product-form')}
          style={styles.fabBtn}>
          <MaterialIcons name="add" size={28} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      {deleting ? (
        <Modal
          animationType="fade"
          onRequestClose={() => setDeleting(null)}
          statusBarTranslucent
          transparent
          visible>
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Xác nhận xóa sản phẩm?</Text>
              <Text style={styles.modalBody}>
                Hành động này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setDeleting(null)} style={styles.modalCancel}>
                  <Text style={styles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    deleteProduct(deleting.id);
                    setDeleting(null);
                  }}
                  style={styles.modalConfirm}>
                  <Text style={styles.modalConfirmText}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  filterWrap: {
    height: 64,
  },
  filterRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  chipWrap: {
    marginRight: 4,
  },
  statsCard: {
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderColor: 'rgba(0,74,198,0.18)',
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 4,
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 14,
  },
  statsTitle: {
    ...typography.labelMd,
    color: colors.primary,
  },
  statsValue: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  statsHint: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: 4,
  },
  list: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.2)',
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadow.level1,
  },
  imageWrap: {
    backgroundColor: colors.surfaceVariant,
    height: 192,
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  statusBadge: {
    borderRadius: radius.full,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    position: 'absolute',
    top: 12,
    zIndex: 2,
  },
  statusBadgeText: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  menuBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.8)',
    borderRadius: radius.full,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    top: 12,
    width: 32,
    zIndex: 2,
  },
  cardBody: {
    padding: 16,
  },
  itemTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  price: {
    ...typography.headlineMd,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  cardFooter: {
    alignItems: 'center',
    borderTopColor: 'rgba(195,198,215,0.3)',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
  },
  stockRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  stockText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 2,
  },
  fab: {
    position: 'absolute',
    right: 16,
  },
  fabBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 4,
    width: 56,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(11,28,48,0.4)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 28,
    gap: 16,
    maxWidth: 400,
    padding: 24,
    width: '100%',
    ...shadow.level3,
  },
  modalTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  modalBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalCancel: {
    alignItems: 'center',
    borderRadius: radius.full,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  modalCancelText: {
    ...typography.button,
    color: colors.onSurfaceVariant,
  },
  modalConfirm: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: radius.full,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  modalConfirmText: {
    ...typography.button,
    color: colors.onError,
  },
});
