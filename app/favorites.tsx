import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { Product } from '@/src/types';
import { distanceFromCenter } from '@/src/utils/filter';
import { distanceLabel, formatCurrency } from '@/src/utils/format';

function WishlistCard({
  product,
  onPress,
  onRemove,
}: {
  product: Product;
  onPress: () => void;
  onRemove: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image
          contentFit="cover"
          source={{ uri: product.images?.[0] || product.image }}
          style={styles.image}
        />
        <TouchableOpacity
          accessibilityLabel="Xóa khỏi yêu thích"
          onPress={onRemove}
          style={styles.heartButton}>
          <Ionicons name="heart" size={20} color={colors.error} />
        </TouchableOpacity>
        <View style={styles.distanceTag}>
          <Ionicons name="location" size={14} color={colors.primary} />
          <Text style={styles.distanceText}>
            {product.location
              ? distanceLabel(
                  distanceFromCenter(product.location.latitude, product.location.longitude)
                )
              : '---'}
          </Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.cardTitle}>
          {product.title}
        </Text>
        <Text style={styles.cardPrice}>{formatCurrency(product.price)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products, favoriteIds, toggleFavorite } = useStore();
  const [category, setCategory] = useState('Tất cả');

  const favorites = useMemo(
    () => products.filter((p) => favoriteIds.includes(p.id)),
    [products, favoriteIds]
  );

  const categories = useMemo(() => {
    const set = new Set(favorites.map((p) => p.category));
    return ['Tất cả', ...Array.from(set)];
  }, [favorites]);

  const visible = useMemo(
    () => (category === 'Tất cả' ? favorites : favorites.filter((p) => p.category === category)),
    [favorites, category]
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <Text style={styles.title}>Yêu thích</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/explore')}
          style={styles.headerBtn}>
          <Ionicons name="search" size={22} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          favorites.length > 0 ? (
            <View style={styles.chipRow}>
              {categories.map((c) => {
                const active = c === category;
                return (
                  <TouchableOpacity
                    key={c}
                    activeOpacity={0.85}
                    onPress={() => setCategory(c)}
                    style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null
        }
        renderItem={({ item }: { item: Product }) => (
          <WishlistCard
            product={item}
            onPress={() => router.push(`/product/${item.id}`)}
            onRemove={() => toggleFavorite(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="Chưa có sản phẩm yêu thích"
            description="Bấm trái tim trên mỗi sản phẩm để lưu lại những món đồ bạn quan tâm nhé."
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/explore')}
              style={styles.cta}>
              <Text style={styles.ctaText}>Khám phá ngay</Text>
            </TouchableOpacity>
          </EmptyState>
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
    ...typography.headlineSm,
    color: colors.primary,
    flex: 1,
    fontWeight: '700',
    textAlign: 'center',
  },
  list: {
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  row: {
    gap: 16,
    justifyContent: 'space-between',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    marginTop: 4,
  },
  chip: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: 'rgba(0,74,198,0.1)',
    borderColor: 'rgba(0,74,198,0.2)',
    borderWidth: 1,
  },
  chipText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    flex: 1,
    maxWidth: '48.5%',
    overflow: 'hidden',
    ...shadow.level1,
  },
  imageWrap: {
    aspectRatio: 1,
    backgroundColor: colors.surfaceContainer,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  heartButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.8)',
    borderRadius: radius.full,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    top: 8,
    width: 32,
  },
  distanceTag: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.8)',
    borderRadius: radius.lg,
    bottom: 8,
    flexDirection: 'row',
    gap: 4,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
  },
  distanceText: {
    color: colors.onSurface,
    fontSize: 10,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    gap: 4,
    padding: 12,
  },
  cardTitle: {
    ...typography.bodySm,
    color: colors.onSurface,
    lineHeight: 18,
  },
  cardPrice: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  cta: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    marginTop: 4,
    paddingHorizontal: 28,
    paddingVertical: 13,
  },
  ctaText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});
