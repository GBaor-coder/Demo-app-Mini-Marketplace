import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { Product } from '@/src/types';
import { distanceFromCenter } from '@/src/utils/filter';
import { distanceLabel, formatCurrency } from '@/src/utils/format';

type ProductCardProps = {
  product: Product;
  onPress: () => void;
  favorite?: boolean;
  onToggleFavorite?: () => void;
  compact?: boolean;
};

export function ProductCard({
  product,
  onPress,
  favorite,
  onToggleFavorite,
  compact,
}: ProductCardProps) {
  const { getUserById } = useStore();
  const seller = getUserById(product.sellerId);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image
          contentFit="cover"
          source={{ uri: product.images[0] || product.image }}
          style={styles.image}
        />
        {seller?.verified && product.status !== 'sold' && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={13} color={colors.tertiary} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
        {product.status === 'sold' && (
          <View style={styles.soldOverlay}>
            <Text style={styles.soldText}>ĐÃ BÁN</Text>
          </View>
        )}
        {product.allowsCod && product.status !== 'sold' && (
          <View style={styles.codBadge}>
            <Text style={styles.codText}>COD</Text>
          </View>
        )}
        {onToggleFavorite ? (
          <TouchableOpacity
            accessibilityLabel="Yêu thích sản phẩm"
            onPress={onToggleFavorite}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.favoriteButton}>
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={18}
              color={favorite ? colors.error : colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text numberOfLines={compact ? 1 : 1} style={styles.title}>
          {product.title}
        </Text>
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <Ionicons name="school-outline" size={14} color={colors.onSurfaceVariant} />
            <Text numberOfLines={1} style={styles.metaText}>
              {seller?.campus || 'Trường đại học'}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.onSurfaceVariant} />
            <Text style={styles.metaText}>
              {distanceLabel(distanceFromCenter(product.location.latitude, product.location.longitude))}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
    flex: 1,
    maxWidth: '48.5%',
    overflow: 'hidden',
    ...shadow.level1,
  },
  imageWrap: {
    aspectRatio: 1,
    backgroundColor: colors.surfaceVariant,
    position: 'relative',
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  verifiedBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.9)',
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: 4,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    position: 'absolute',
    top: 8,
  },
  verifiedText: {
    color: colors.onSurface,
    fontSize: 10,
    fontWeight: '500',
  },
  favoriteButton: {
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
  soldOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(11,28,48,0.58)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  soldText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  codBadge: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: radius.lg,
    bottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    position: 'absolute',
    right: 0,
  },
  codText: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  body: {
    padding: 12,
  },
  title: {
    ...typography.bodySm,
    color: colors.onSurface,
    fontWeight: '500',
    lineHeight: 20,
  },
  price: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  meta: {
    flexDirection: 'column',
    gap: 4,
    marginTop: 8,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  metaText: {
    color: colors.onSurfaceVariant,
    flexShrink: 1,
    fontSize: 12,
  },
});
