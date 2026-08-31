import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
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

const HOME_CATEGORIES: {
  category: ProductCategory;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  background: string;
  color: string;
}[] = [
    {
      category: 'Giáo trình',
      label: 'Giáo trình',
      icon: 'menu-book',
      background: 'rgba(0,74,198,0.10)',
      color: colors.primary,
    },
    {
      category: 'Đồ điện tử',
      label: 'Đồ điện tử',
      icon: 'laptop-mac',
      background: 'rgba(0,88,190,0.10)',
      color: colors.secondary,
    },
    {
      category: 'Đồ dùng học tập',
      label: 'Đồ dùng\nhọc tập',
      icon: 'edit',
      background: 'rgba(0,98,41,0.10)',
      color: colors.tertiary,
    },
    {
      category: 'Đồ ký túc xá',
      label: 'Đồ ký túc xá',
      icon: 'checkroom',
      background: 'rgba(186,26,26,0.10)',
      color: colors.error,
    },
  ];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products, favoriteIds, toggleFavorite, cart, currentUser } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const searchScale = useRef(new Animated.Value(1)).current;

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  const handlePressSearchIn = () => {
    Animated.spring(searchScale, {
      toValue: 0.96,
      speed: 40,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const handlePressSearchOut = () => {
    Animated.spring(searchScale, {
      toValue: 1,
      speed: 30,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  };

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
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <AnimatedPressable
          accessibilityLabel="Tìm kiếm"
          onPressIn={handlePressSearchIn}
          onPressOut={handlePressSearchOut}
          onPress={() => router.push('/search')}
          style={[styles.searchIconButton, { transform: [{ scale: searchScale }] }]}>
          <MaterialIcons name="search" size={20} color={colors.primary} />
        </AnimatedPressable>

        <Text style={styles.brand}>UniLoop</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/cart')}
          style={styles.cartBtn}>
          <MaterialIcons name="shopping-cart" size={20} color={colors.primary} />
          {cartCount > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
            </View>
          ) : null}
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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Danh mục</Text>
              <TouchableOpacity onPress={() => router.push('/')}>
                <Text style={styles.sectionLink}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              contentContainerStyle={styles.categoriesContent}>
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
                  <Text numberOfLines={2} style={styles.categoryLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

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
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.92)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 20,
    ...shadow.level1,
  },
  searchIconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderColor: 'rgba(0,74,198,0.22)',
    borderRadius: radius.full,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  brand: {
    ...typography.headlineMd,
    color: colors.primary,
    fontSize: 21,
    textAlign: 'center',
    flex: 1,
  },
  cartBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderColor: 'rgba(0,74,198,0.22)',
    borderRadius: radius.full,
    borderWidth: 1,
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
    right: -2,
    top: -2,
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
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 16,
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
  categoriesScroll: {
    marginHorizontal: -20,
    marginBottom: 24,
  },
  categoriesContent: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 6,
    width: 78,
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
    lineHeight: 16,
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
