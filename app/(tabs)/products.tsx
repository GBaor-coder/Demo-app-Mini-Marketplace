import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState, MaterialIcons, ScreenHeader } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { Product } from '@/src/types';
import { formatCurrency } from '@/src/utils/format';

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

export default function SellerProductsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, products, deleteProduct } = useStore();
  const [deleting, setDeleting] = useState<Product | null>(null);

  const myProducts = useMemo(() => {
    if (!currentUser) return [];
    return products.filter(
      (p) => p.sellerId === currentUser.id && p.status !== 'draft'
    );
  }, [currentUser, products]);

  const openMenu = (item: Product) => {
    Alert.alert(item.title, undefined, [
      { text: 'Sửa sản phẩm', onPress: () => router.push(`/product-form?id=${item.id}`) },
      { text: 'Xóa sản phẩm', style: 'destructive', onPress: () => setDeleting(item) },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const renderItem = ({ item }: { item: Product }) => {
    const imageUri = productImageUri(item);
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

      <FlatList
        data={myProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="sell"
            title="Chưa có sản phẩm"
            description="Đăng tin bán sản phẩm đầu tiên của bạn để bắt đầu."
          >
            <Button title="Đăng sản phẩm" icon="add" onPress={() => router.push('/product-form')} />
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
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  pageTitle: {
    ...typography.displayLgMobile,
    color: colors.onSurface,
    fontSize: 24,
    marginBottom: 20,
    marginHorizontal: 20,
    marginTop: 20,
  },
  list: {
    gap: 16,
    padding: 20,
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
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 20,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 100,
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
