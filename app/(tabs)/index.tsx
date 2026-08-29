import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductCard } from '@/src/components/ProductCard';
import { Button, MaterialIcons } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { Product, ProductCategory } from '@/src/types';

const BANNER_IMAGE =
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=900';

const HOME_CATEGORIES: {
  category: ProductCategory;
  icon: keyof typeof MaterialIcons.glyphMap;
  background: string;
  color: string;
}[] = [
  {
    category: 'Giáo trình',
    icon: 'menu-book',
    background: 'rgba(0,74,198,0.10)',
    color: colors.primary,
  },
  {
    category: 'Đồ điện tử',
    icon: 'laptop-mac',
    background: 'rgba(0,88,190,0.10)',
    color: colors.secondary,
  },
  {
    category: 'Đồ dùng học tập',
    icon: 'edit',
    background: 'rgba(0,98,41,0.10)',
    color: colors.tertiary,
  },
  {
    category: 'Đồ ký túc xá',
    icon: 'checkroom',
    background: 'rgba(186,26,26,0.10)',
    color: colors.error,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products, favoriteIds, toggleFavorite, cart, currentUser } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  const activeProducts = products.filter((p) => p.status === 'active');
  const myProducts = currentUser
    ? products.filter((p) => p.sellerId === currentUser.id && p.status === 'active')
    : [];

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
        showLocation
      />
    ),
    [favoriteIds, router, toggleFavorite]
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>UniLoop</Text>
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
          <Text style={styles.searchPlaceholder}>Tìm kiếm tài liệu, đồ dùng học tập...</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.banner}>
              <Image source={{ uri: BANNER_IMAGE }} style={styles.bannerImage} contentFit="cover" />
              <View style={styles.bannerScrim} />
              <View style={styles.bannerContent}>
                <View style={styles.bannerBadge}>
                  <Text style={styles.bannerBadgeText}>Ưu đãi Sinh viên</Text>
                </View>
                <Text style={styles.bannerTitle}>Chào năm học mới! Giảm 50% giáo trình</Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push({ pathname: '/search-results', params: { category: 'Giáo trình' } })
                  }
                  style={styles.bannerButton}>
                  <Text style={styles.bannerButtonText}>Mua ngay</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Danh mục</Text>
              <TouchableOpacity onPress={() => router.push('/')}>
                <Text style={styles.sectionLink}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.categories}>
              {HOME_CATEGORIES.map((item) => (
                <TouchableOpacity
                  key={item.category}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname: '/search-results',
                      params: { category: item.category },
                    })
                  }
                  style={styles.categoryItem}>
                  <View style={[styles.categoryIcon, { backgroundColor: item.background }]}>
                    <MaterialIcons name={item.icon} size={24} color={item.color} />
                  </View>
                  <Text style={styles.categoryLabel}>{item.category}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Gợi ý hôm nay</Text>
              <TouchableOpacity onPress={() => router.push('/')}>
                <Text style={styles.sectionLink}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {myProducts.length > 0 && (
              <View style={styles.sellerBanner}>
                <View style={styles.sellerBannerInfo}>
                  <MaterialIcons name="storefront" size={20} color={colors.primary} />
                  <View style={styles.sellerBannerText}>
                    <Text style={styles.sellerBannerTitle}>Cửa hàng của bạn</Text>
                    <Text style={styles.sellerBannerSub}>
                      {myProducts.length} sản phẩm đang bán
                    </Text>
                  </View>
                </View>
                <View style={styles.sellerBannerActions}>
                  <TouchableOpacity onPress={() => router.push('/products')}>
                    <Text style={styles.sellerBannerLink}>Quản lý</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push('/create')}>
                    <Text style={styles.sellerBannerLink}>Đăng thêm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        }
        renderItem={renderCard}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <MaterialIcons name="storefront" size={48} color={colors.outline} />
            <Text style={styles.emptyTitle}>Chưa có sản phẩm nào</Text>
            <Text style={styles.emptyText}>Hãy là người đầu tiên đăng bán nhé!</Text>
            <Button
              title="Đăng sản phẩm"
              icon="add"
              onPress={() => router.push('/create')}
              style={styles.emptyBtn}
            />
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
    fontSize: 24,
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
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
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
    marginBottom: 16,
  },
  banner: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    height: 200,
    marginBottom: 24,
    marginTop: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,28,48,0.72)',
  },
  bannerContent: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    padding: 24,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,74,198,0.25)',
    borderColor: 'rgba(0,74,198,0.35)',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  bannerBadgeText: {
    color: colors.primaryFixedDim,
    fontSize: 14,
    fontWeight: '500',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    maxWidth: 260,
  },
  bannerButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 16,
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 4,
  },
  bannerButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
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
    borderRadius: radius.xl,
    height: 64,
    justifyContent: 'center',
    width: 64,
    ...shadow.level1,
  },
  categoryLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
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
  emptyBtn: {
    marginTop: 16,
  },
  sellerBanner: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(0,74,198,0.15)',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: 14,
  },
  sellerBannerInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: 10,
  },
  sellerBannerText: {
    flex: 1,
    gap: 2,
  },
  sellerBannerTitle: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: '600',
  },
  sellerBannerSub: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  sellerBannerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  sellerBannerLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
