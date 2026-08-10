import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { Product } from '@/src/types';
import { formatCurrency } from '@/src/utils/format';

type Tab = 'active' | 'transaction' | 'sold' | 'draft';

export default function SellerProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, products, orders, deleteProduct } = useStore();
  const [tab, setTab] = useState<Tab>('active');
  const [deleting, setDeleting] = useState<Product | null>(null);

  const activeOrderProductIds = useMemo(() => {
    if (!currentUser) return new Set<string>();
    const set = new Set<string>();
    orders
      .filter(
        (o) =>
          o.sellerId === currentUser.id &&
          (o.status === 'pending' || o.status === 'confirmed' || o.status === 'in_transaction')
      )
      .forEach((o) => o.items.forEach((item) => set.add(item.productId)));
    return set;
  }, [currentUser, orders]);

  const myProducts = useMemo(() => {
    if (!currentUser) return [];
    const mine = products.filter((p) => p.sellerId === currentUser.id);
    if (tab === 'transaction') {
      return mine.filter((p) => p.status === 'active' && activeOrderProductIds.has(p.id));
    }
    if (tab === 'active') {
      return mine.filter((p) => p.status === 'active' && !activeOrderProductIds.has(p.id));
    }
    if (tab === 'sold') return mine.filter((p) => p.status === 'sold');
    return mine.filter((p) => p.status === 'draft');
  }, [currentUser, products, tab, activeOrderProductIds]);

  const stats = useMemo(() => {
    const mine = products.filter((p) => p.sellerId === currentUser?.id);
    const selling = mine.filter((p) => p.status === 'active');
    return {
      active: selling.filter((p) => !activeOrderProductIds.has(p.id)).length,
      transaction: selling.filter((p) => activeOrderProductIds.has(p.id)).length,
      sold: mine.filter((p) => p.status === 'sold').length,
      draft: mine.filter((p) => p.status === 'draft').length,
    };
  }, [currentUser?.id, products, activeOrderProductIds]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'active', label: `Đang bán (${stats.active})` },
    { key: 'transaction', label: `Chờ giao dịch (${stats.transaction})` },
    { key: 'sold', label: `Đã bán (${stats.sold})` },
    { key: 'draft', label: `Bản nháp (${stats.draft})` },
  ];

  const statusChip = (status: Product['status']) => {
    if (status === 'active') {
      return { bg: 'rgba(0,126,55,0.9)', fg: colors.onTertiaryContainer, dot: colors.tertiaryFixed, label: 'Đang bán' };
    }
    if (status === 'sold') {
      return { bg: colors.surfaceContainerHigh, fg: colors.onSurfaceVariant, dot: colors.outline, label: 'Đã bán' };
    }
    return { bg: colors.surfaceContainer, fg: colors.onSurfaceVariant, dot: colors.outline, label: 'Nháp' };
  };

  const openMenu = (item: Product) => {
    Alert.alert(item.title, undefined, [
      { text: 'Sửa sản phẩm', onPress: () => router.push(`/product-form?id=${item.id}`) },
      { text: 'Xóa sản phẩm', style: 'destructive', onPress: () => setDeleting(item) },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const renderItem = ({ item }: { item: Product }) => {
    const chip = statusChip(item.status);
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/product-preview?id=${item.id}`)}
        style={styles.card}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: item.images[0] || item.image }} style={styles.image} />
          <View style={[styles.statusChip, { backgroundColor: chip.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: chip.dot }]} />
            <Text style={[styles.statusChipText, { color: chip.fg }]}>{chip.label}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => openMenu(item)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={styles.menuBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
        <View style={styles.cardBody}>
          <Text numberOfLines={2} style={styles.itemTitle}>
            {item.title}
          </Text>
          <Text style={styles.price}>{formatCurrency(item.price)}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.stockRow}>
              <Ionicons name="cube-outline" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.stockText}>Tồn kho: {item.stock}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => router.push(`/product-form?id=${item.id}`)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.actionBtn}>
                <Ionicons name="create-outline" size={18} color={colors.secondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDeleting(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>UniLoop</Text>
        <View style={styles.headerBtn} />
      </View>

      <Text style={styles.pageTitle}>Quản lý sản phẩm</Text>

      <View style={styles.tabs}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tabs}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.tabsContent}
          renderItem={({ item }) => {
            const active = tab === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.8}
                onPress={() => setTab(item.key)}
                style={[styles.tab, active && styles.tabActive]}>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={myProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="pricetags-outline"
            title="Chưa có sản phẩm"
            description="Đăng tin bán sản phẩm đầu tiên của bạn để bắt đầu."
          >
            <Button title="Đăng sản phẩm" icon="add" onPress={() => router.push('/product-form')} />
          </EmptyState>
        }
      />

      <View style={[styles.fab, { bottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/product-form')}
          style={styles.fabBtn}>
          <Ionicons name="add" size={28} color={colors.onPrimary} />
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
    width: 40,
  },
  title: {
    ...typography.headlineMd,
    color: colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  pageTitle: {
    ...typography.displayLgMobile,
    color: colors.onSurface,
    marginBottom: 24,
    marginHorizontal: 20,
    marginTop: 24,
  },
  tabs: {
    borderBottomColor: 'rgba(195,198,215,0.3)',
    borderBottomWidth: 1,
    marginBottom: 24,
  },
  tabsContent: {
    gap: 8,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  tab: {
    alignItems: 'center',
    borderRadius: radius.full,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(0,74,198,0.1)',
  },
  tabText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: colors.primary,
  },
  list: {
    gap: 16,
    padding: 20,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.2)',
    borderRadius: radius['2xl'],
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
  statusChip: {
    alignItems: 'center',
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: 4,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    position: 'absolute',
    top: 12,
    zIndex: 2,
  },
  statusDot: {
    borderRadius: radius.full,
    height: 8,
    width: 8,
  },
  statusChipText: {
    ...typography.labelMd,
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
