import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState, MaterialIcons, SkeletonCard } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { Product, ProductCategory } from '@/src/types';
import { formatCurrency } from '@/src/utils/format';

const EXPLORE_CATEGORIES: {
  category: ProductCategory;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { category: 'Giáo trình', icon: 'menu-book' },
  { category: 'Đồ điện tử', icon: 'devices' },
  { category: 'Đồ dùng học tập', icon: 'architecture' },
  { category: 'Đồ ký túc xá', icon: 'chair' },
  { category: 'Handmade', icon: 'brush' },
];

function isNewProduct(createdAt: string): boolean {
  const diff = Date.now() - new Date(createdAt).getTime();
  return diff < 3 * 24 * 60 * 60 * 1000;
}

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products, favoriteIds, toggleFavorite, cart } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  const activeProducts = selectedCategory
    ? products.filter((p) => p.status === 'active' && p.category === selectedCategory)
    : products.filter((p) => p.status === 'active');

  const switchCategory = useCallback((cat: ProductCategory | null) => {
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
    setLoading(true);
    setSelectedCategory(cat);
    loadingTimer.current = setTimeout(() => setLoading(false), 400);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const renderCard = useCallback(
    ({ item }: { item: Product }) => (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/product/${item.id}`)}
        style={styles.card}>
        <View style={styles.imageWrap}>
          <Image
            contentFit="cover"
            source={{ uri: item.images?.[0] || item.image }}
            style={styles.image}
          />
          {isNewProduct(item.createdAt) ? (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>MỚI</Text>
            </View>
          ) : null}
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => toggleFavorite(item.id)}
            style={styles.favorite}>
            <MaterialIcons
              name={favoriteIds.includes(item.id) ? 'favorite' : 'favorite-border'}
              size={18}
              color={favoriteIds.includes(item.id) ? colors.error : colors.onSurface}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.body}>
          <Text numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>
          <Text numberOfLines={1} style={styles.location}>
            {item.location?.address ?? '---'}
          </Text>
          <Text style={styles.price}>{formatCurrency(item.price)}</Text>
        </View>
      </TouchableOpacity>
    ),
    [favoriteIds, router, toggleFavorite]
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Khám phá</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/search')}
              style={styles.headerBtn}>
              <MaterialIcons name="search" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/cart')}
              style={styles.cartBtn}>
              <MaterialIcons name="shopping-cart" size={24} color={colors.onSurfaceVariant} />
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
          <MaterialIcons name="search" size={19} color={colors.outline} />
          <Text style={styles.searchPlaceholder}>Tìm kiếm sách, đồ dùng...</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={loading ? [] : activeProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View>
            <Text style={styles.sectionTitle}>Danh mục</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryStrip}>
              {EXPLORE_CATEGORIES.map((item) => {
                const active = selectedCategory === item.category;
                return (
                  <TouchableOpacity
                    key={item.category}
                    activeOpacity={0.8}
                    onPress={() =>
                      switchCategory(active ? null : item.category)
                    }
                    style={styles.categoryItem}>
                    <View
                      style={[styles.categoryCircle, active && styles.categoryCircleActive]}>
                      <MaterialIcons
                        name={item.icon}
                        size={28}
                        color={active ? colors.onPrimaryContainer : colors.onSurface}
                      />
                    </View>
                    <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>
                      {item.category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
              <TouchableOpacity onPress={() => router.push('/search-results')}>
                <Text style={styles.sectionLink}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={renderCard}
        ListEmptyComponent={
          loading ? (
            <View style={styles.skeletonGrid}>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} imageHeight={160} style={styles.skeletonCard} />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="search-off"
              title="Chưa có sản phẩm nào"
              description={
                selectedCategory
                  ? `Không có sản phẩm trong danh mục "${selectedCategory}".`
                  : 'Hãy là người đầu tiên đăng bán nhé!'
              }
            >
              <Button
                title={selectedCategory ? 'Xóa bộ lọc' : 'Đăng sản phẩm'}
                variant={selectedCategory ? 'outline' : 'primary'}
                onPress={() =>
                  selectedCategory ? switchCategory(null) : router.push('/create')
                }
              />
            </EmptyState>
          )
        }
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
  headerTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontSize: 22,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  headerBtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
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
  list: {
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  row: {
    gap: 16,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontSize: 18,
    marginBottom: 14,
    marginTop: 20,
  },
  categoryStrip: {
    gap: 14,
    marginBottom: 4,
    paddingBottom: 6,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 6,
    minWidth: 80,
  },
  categoryCircle: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: radius.full,
    height: 64,
    justifyContent: 'center',
    width: 64,
    ...shadow.level1,
  },
  categoryCircleActive: {
    backgroundColor: colors.primaryContainer,
  },
  categoryLabel: {
    color: colors.onSurface,
    fontSize: 14,
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 20,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  skeletonCard: {
    flex: 1,
    minWidth: '45%',
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    flex: 1,
    marginBottom: 16,
    maxWidth: '48.5%',
    overflow: 'hidden',
    ...shadow.level1,
  },
  imageWrap: {
    backgroundColor: colors.surfaceContainerLow,
    height: 160,
    position: 'relative',
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  newBadge: {
    backgroundColor: 'rgba(0,74,198,0.10)',
    borderRadius: radius.full,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    top: 8,
  },
  newBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  favorite: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: radius.full,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    top: 8,
    width: 32,
  },
  body: {
    padding: 12,
  },
  title: {
    ...typography.bodySm,
    color: colors.onSurface,
    fontWeight: '500',
    lineHeight: 20,
    minHeight: 40,
  },
  location: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    marginTop: 6,
  },
  price: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
});
