import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStore } from '@/src/context/store-context';
import { CATEGORIES, CATEGORY_ICONS } from '@/src/data/seed';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { Product, ProductCategory } from '@/src/types';
import { formatCurrency } from '@/src/utils/format';

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products, favoriteIds, toggleFavorite } = useStore();

  const activeProducts = products.filter((p) => p.status === 'active');

  const renderCard = useCallback(
    ({ item }: { item: Product }) => (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/product/${item.id}`)}
        style={styles.card}>
        <View style={styles.imageWrap}>
          <Image
            contentFit="cover"
            source={{ uri: item.images[0] || item.image }}
            style={styles.image}
          />
          {item.stock <= 1 ? (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>MỚI</Text>
            </View>
          ) : null}
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => toggleFavorite(item.id)}
            style={styles.favorite}>
            <Ionicons
              name={favoriteIds.includes(item.id) ? 'heart' : 'heart-outline'}
              size={18}
              color={favoriteIds.includes(item.id) ? '#e11d48' : colors.onSurface}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.body}>
          <Text numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>
          <Text numberOfLines={1} style={styles.location}>
            {item.location.address}
          </Text>
          <Text style={styles.price}>{formatCurrency(item.price)}</Text>
        </View>
      </TouchableOpacity>
    ),
    [favoriteIds, router, toggleFavorite]
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          activeOpacity={0.7}
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
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Text style={styles.sectionTitle}>Danh mục</Text>
            <ScrollViewHorizontal />
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
              <TouchableOpacity onPress={() => router.push('/search-results')}>
                <Text style={styles.sectionLink}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={renderCard}
      />
    </View>
  );
}

function ScrollViewHorizontal() {
  const router = useRouter();
  return (
    <View style={styles.categoryStrip}>
      {CATEGORIES.map((category: ProductCategory, index) => {
        const active = index === 0;
        return (
          <TouchableOpacity
            key={category}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/search-results', params: { category } })}
            style={styles.categoryItem}>
            <View style={[styles.categoryCircle, active && styles.categoryCircleActive]}>
              <Ionicons
                name={CATEGORY_ICONS[category] as keyof typeof Ionicons.glyphMap}
                size={27}
                color={active ? colors.onPrimaryContainer : colors.onSurface}
              />
            </View>
            <Text style={styles.categoryLabel}>{category}</Text>
          </TouchableOpacity>
        );
      })}
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
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: 10,
    minHeight: 42,
    paddingHorizontal: 16,
  },
  searchPlaceholder: {
    color: colors.outline,
    fontSize: 14,
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
    flexDirection: 'row',
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
  },
  categoryCircleActive: {
    backgroundColor: colors.primaryContainer,
  },
  categoryLabel: {
    color: colors.onSurface,
    fontSize: 14,
    textAlign: 'center',
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
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
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
