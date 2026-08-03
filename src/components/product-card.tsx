import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, shadow } from '@/src/theme/colors';
import { Product } from '@/src/types';
import { formatCurrency } from '@/src/utils/format';

type ProductCardProps = {
  product: Product;
  onPress: () => void;
  favorite?: boolean;
  onToggleFavorite?: () => void;
};

export function ProductCard({
  product,
  onPress,
  favorite,
  onToggleFavorite,
}: ProductCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image contentFit="cover" source={{ uri: product.image }} style={styles.image} />
        {product.status === 'sold' && (
          <View style={styles.soldOverlay}>
            <Text style={styles.soldText}>ĐÃ BÁN</Text>
          </View>
        )}
        {onToggleFavorite && (
          <TouchableOpacity
            accessibilityLabel="Yêu thích sản phẩm"
            onPress={onToggleFavorite}
            style={styles.favoriteButton}>
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={19}
              color={favorite ? colors.accent : colors.ink}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.title}>
          {product.title}
        </Text>
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        <View style={styles.metaRow}>
          <Text numberOfLines={1} style={styles.condition}>
            {product.condition}
          </Text>
          <Text style={styles.stock}>Còn {product.stock}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginBottom: 12,
    maxWidth: '48.5%',
    overflow: 'hidden',
    ...shadow,
  },
  imageWrap: {
    aspectRatio: 1,
    backgroundColor: colors.primarySoft,
    position: 'relative',
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  favoriteButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    top: 8,
    width: 34,
  },
  soldOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(17,26,23,0.58)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  soldText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  body: {
    minHeight: 113,
    padding: 11,
  },
  title: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    minHeight: 38,
  },
  price: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 7,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
    marginTop: 8,
  },
  condition: {
    color: colors.inkMuted,
    flex: 1,
    fontSize: 11,
  },
  stock: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
});
