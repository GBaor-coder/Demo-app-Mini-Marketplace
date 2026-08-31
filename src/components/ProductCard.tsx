import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MaterialIcons } from '@/src/components/ui/Icon';
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
  showSeller?: boolean;
  showLocation?: boolean;
  imageHeight?: number;
  badge?: string;
};

export function ProductCard({
  product,
  onPress,
  favorite,
  onToggleFavorite,
  compact,
  showSeller,
  showLocation,
  imageHeight = 160,
  badge,
}: ProductCardProps) {
  const { getUserById } = useStore();
  const seller = getUserById(product.sellerId);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={[styles.imageWrap, { height: imageHeight }]}>
        <Image
          contentFit="cover"
          source={{ uri: product.images?.[0] || product.image }}
          style={styles.image}
        />
        {badge ? (
          <View style={[styles.badge, badge === 'HOT' ? styles.badgeHot : styles.badgeNew]}>
            <Text style={[styles.badgeText, badge === 'HOT' && styles.badgeTextHot]}>{badge}</Text>
          </View>
        ) : null}
        {seller?.verified && product.status !== 'sold' && (
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="verified" size={13} color={colors.tertiary} />
            <Text style={styles.verifiedText}>Đã xác thực</Text>
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
            <MaterialIcons
              name={favorite ? 'favorite' : 'favorite-border'}
              size={18}
              color={favorite ? colors.error : colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.title}>
          {product.title}
        </Text>
        {showLocation ? (
          <Text numberOfLines={2} style={styles.location}>
            {product.location?.address ?? '---'}
          </Text>
        ) : null}
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        {showSeller ? (
          <View style={styles.meta}>
            <View style={styles.metaRow}>
              <MaterialIcons name="school" size={14} color={colors.onSurfaceVariant} />
              <Text numberOfLines={1} style={styles.metaText}>
                {seller?.campus || 'Trường đại học'}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <MaterialIcons name="location-on" size={14} color={colors.onSurfaceVariant} />
              <Text style={styles.metaText}>
                {product.location
                  ? distanceLabel(distanceFromCenter(product.location.latitude, product.location.longitude))
                  : '---'}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    flex: 1,
    maxWidth: '48.5%',
    overflow: 'hidden',
    ...shadow.level1,
  },
  imageWrap: {
    backgroundColor: colors.surfaceContainerLow,
    position: 'relative',
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  badge: {
    borderRadius: radius.full,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    position: 'absolute',
    top: 8,
    zIndex: 2,
  },
  badgeNew: {
    backgroundColor: 'rgba(0,74,198,0.10)',
    borderColor: 'rgba(0,74,198,0.30)',
    borderWidth: 1,
  },
  badgeHot: {
    backgroundColor: colors.error,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeTextHot: {
    color: colors.onError,
  },
  verifiedBadge: {
    alignItems: 'center',
    backgroundColor: colors.tertiaryContainer,
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
  },
  verifiedText: {
    color: colors.onTertiaryContainer,
    fontSize: 10,
    fontWeight: '600',
  },
  favoriteButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: radius.full,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    top: 8,
    width: 32,
    zIndex: 3,
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
    borderTopLeftRadius: radius.sm,
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
    minHeight: 40,
  },
  location: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
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
    borderTopColor: 'rgba(195,198,215,0.3)',
    borderTopWidth: 1,
    paddingTop: 8,
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
