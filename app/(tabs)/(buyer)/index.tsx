import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';

import { ProductCard } from '@/src/components/ProductCard';
import { SkeletonCard } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { CATEGORIES, CATEGORY_ICONS } from '@/src/data/seed';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { Product } from '@/src/types';

const HOME_CATEGORIES = CATEGORIES.slice(0, 4);

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products, favoriteIds, toggleFavorite, cart } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  const activeProducts = products.filter((p) => p.status === 'active');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const renderCard = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        product={item}
        favorite={favoriteIds.includes(item.id)}
        onToggleFavorite={() => toggleFavorite(item.id)}
        onPress={() => router.push(`/product/${item.id}`)}
      />
    ),
    [favoriteIds, router, toggleFavorite]
  );

  const renderSkeleton = useCallback(
    () => <SkeletonCard style={styles.skeletonCard} />,
    []
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>UniLoop</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/cart')}
              style={styles.cartBtn}>
              <Ionicons name="cart-outline" size={24} color={colors.onSurfaceVariant} />
              {cartCount > 0 ? (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/search')}
          style={styles.searchBar}>
          <Ionicons name="search" size={19} color={colors.outline} />
          <Text style={styles.searchPlaceholder}>Tìm kiếm sách, đồ dùng...</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View>
            <View style={styles.banner}>
              <View style={styles.bannerContent}>
                <View style={styles.bannerBadge}>
                  <Text style={styles.bannerBadgeText}>Mùa tựu trường</Text>
                </View>
                <Text style={styles.bannerTitle}>Giảm đến 50% sách giáo trình</Text>
                <Text style={styles.bannerBody}>
                  Chuẩn bị cho học kỳ mới với những ưu đãi tuyệt vời từ các anh chị khóa trên.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push('/search')}
                  style={styles.bannerButton}>
                  <Text style={styles.bannerButtonText}>Mua ngay</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.bannerDeco}>
                <Ionicons name="school" size={64} color="rgba(255,255,255,0.35)" />
                <Ionicons name="book" size={40} color="rgba(255,255,255,0.25)" style={styles.bannerDecoSmall} />
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Danh mục</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/(buyer)/explore')}>
                <Text style={styles.sectionLink}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.categories}>
              {HOME_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({ pathname: '/search-results', params: { category } })
                  }
                  style={styles.categoryItem}>
                  <View style={styles.categoryIcon}>
                    <Ionicons
                      name={CATEGORY_ICONS[category] as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={styles.categoryLabel}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Gợi ý hôm nay</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/(buyer)/explore')}>
                <Text style={styles.sectionLink}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={refreshing ? renderSkeleton : renderCard}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="storefront-outline" size={48} color={colors.outline} />
            <Text style={styles.emptyTitle}>Chưa có sản phẩm nào</Text>
            <Text style={styles.emptyText}>Hãy là người đầu tiên đăng bán nhé!</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  header: {
    backgroundColor: 'rgba(248,249,255,0.92)',
    gap: 12,
    paddingBottom: 12,
    paddingHorizontal: 20,
    ...shadow.level1,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cartBtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    position: 'relative',
    width: 40,
  },
  cartBadge: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: radius.full,
    justifyContent: 'center',
    minWidth: 16,
    paddingHorizontal: 4,
    paddingVertical: 1,
    position: 'absolute',
    right: 2,
    top: 2,
  },
  cartBadgeText: {
    color: colors.onError,
    fontSize: 10,
    fontWeight: '700',
  },
  brand: {
    ...typography.headlineMd,
    color: colors.primary,
    fontSize: 22,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 16,
  },
  searchPlaceholder: {
    color: colors.outline,
    fontSize: 15,
  },
  list: {
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  row: {
    gap: 12,
    justifyContent: 'space-between',
  },
  banner: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius['2xl'],
    flexDirection: 'row',
    marginBottom: 24,
    marginTop: 16,
    overflow: 'hidden',
    padding: 20,
    position: 'relative',
  },
  bannerContent: {
    flex: 1,
    gap: 8,
    zIndex: 2,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bannerBadgeText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  bannerTitle: {
    ...typography.headlineSm,
    color: colors.onPrimary,
    fontSize: 18,
    lineHeight: 24,
    marginTop: 4,
    maxWidth: 260,
  },
  bannerBody: {
    color: colors.onPrimary,
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 250,
    opacity: 0.9,
  },
  bannerButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bannerButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  bannerDeco: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'absolute',
    right: -6,
    top: 0,
    bottom: 0,
    width: '34%',
  },
  bannerDecoSmall: {
    marginRight: 26,
    marginTop: -18,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontSize: 18,
  },
  sectionLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 6,
    width: '25%',
  },
  categoryIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderRadius: radius['2xl'],
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  categoryLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  skeletonCard: {
    flex: 1,
    maxWidth: '48.5%',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    marginTop: 12,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
});
