import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/Avatar';
import { LocationPreview } from '@/src/components/location-preview';
import { Button, EmptyState, MaterialIcons } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { distanceFromCenter } from '@/src/utils/filter';
import { distanceLabel, formatCurrency } from '@/src/utils/format';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const {
    products,
    currentUser,
    getUserById,
    favoriteIds,
    toggleFavorite,
    addToCart,
    startChat,
    cart,
  } = useStore();
  const [imageIndex, setImageIndex] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerBgOpacity = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const product = products.find((p) => p.id === id);
  const seller = product ? getUserById(product.sellerId) : undefined;

  if (!product) {
    return (
      <View style={styles.screen}>
        <EmptyState icon="inventory-2" title="Không tìm thấy sản phẩm" description="Sản phẩm này có thể đã bị xóa." />
      </View>
    );
  }

  const images = product.images?.length ? product.images : [product.image];
  const favorite = favoriteIds.includes(product.id);
  const sold = product.status === 'sold';
  const isOutOfStock = product.stock <= 0 && product.status !== 'sold';
  const isSold = product.status === 'sold';
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const isOwnProduct = currentUser?.id === product.sellerId;

  const handleBuyNow = () => {
    addToCart(product.id);
    router.push('/cart');
  };

  const handleChat = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser.id === product.sellerId) {
      Alert.alert('Đây là tin của bạn', 'Bạn không thể nhắn tin với chính mình.');
      return;
    }
    const threadId = await startChat(product.sellerId, product.id);
    if (threadId) {
      router.push(`/chat/${threadId}`);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.headerBackdrop, { opacity: headerBgOpacity }]}
        />
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}>
          <MaterialIcons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>UniLoop</Text>
          <View style={styles.headerAddressRow}>
            <MaterialIcons name="location-on" size={12} color={colors.onSurfaceVariant} />
            <Text numberOfLines={1} style={styles.headerAddress}>
              {product.meetupPoint ?? product.location?.address ?? ''}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/cart')} style={styles.headerButton}>
            <MaterialIcons name="shopping-cart" size={22} color={colors.primary} />
            {cartCount > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <View style={styles.carousel}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))
            }>
            {images.map((uri) => (
              <Image key={uri} contentFit="cover" source={{ uri }} style={{ width, height: 400 }} />
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {images.map((uri, index) => (
              <View
                key={uri}
                style={[styles.dot, index === imageIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockText}>Tồn kho: {product.stock}</Text>
            {product.stock <= 0 && (
              <Text style={styles.stockOutOfText}>Hết hàng</Text>
            )}
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.title}>{product.title}</Text>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            <View style={styles.chips}>
              <View style={styles.chipPrimary}>
                <Text style={styles.chipPrimaryText}>Tình trạng: {product.condition}</Text>
              </View>
              <View style={styles.chipSecondary}>
                <MaterialIcons name="local-offer" size={14} color={colors.secondary} />
                <Text style={styles.chipSecondaryText}>{product.category}</Text>
              </View>
            </View>
          </View>

          <View style={styles.sellerCard}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/store?userId=${product.sellerId}`)}
              style={styles.sellerCardInner}>
              <Avatar uri={seller?.avatar} name={seller?.name} size={56} />
              <View style={styles.sellerInfo}>
                <View style={styles.sellerNameRow}>
                  <Text style={styles.sellerName}>{seller?.name ?? 'Người bán'}</Text>
                  {seller?.verified ? (
                    <MaterialIcons name="verified" size={18} color={colors.primary} />
                  ) : null}
                </View>
                <Text style={styles.sellerUni}>{seller?.campus ?? ''}</Text>
                <View style={styles.sellerTrust}>
                  <MaterialIcons name="star" size={13} color={colors.star} />
                  <Text style={styles.sellerTrustText}>Người bán uy tín</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeading}>
              <MaterialIcons name="description" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            </View>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeading}>
              <MaterialIcons name="location-on" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Địa điểm giao dịch</Text>
            </View>
            <Text style={styles.meetup}>{product.meetupPoint ?? product.location?.address ?? '---'}</Text>
            <Text style={styles.distance}>
              {product.location
                ? `Cách bạn khoảng ${distanceLabel(
                    distanceFromCenter(product.location.latitude, product.location.longitude)
                  )}`
                : 'Giao dịch trực tiếp tại khu vực trường'}
            </Text>
            {product.location ? <LocationPreview location={product.location} /> : null}
          </View>

          {product.allowsCod ? (
            <View style={styles.codCard}>
              <MaterialIcons name="payments" size={20} color={colors.tertiary} />
              <View style={styles.codInfo}>
                <Text style={styles.codTitle}>Hỗ trợ giao hàng COD</Text>
                <Text style={styles.codText}>Phí ship 15.000đ cho nội khu Làng Đại học</Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

{isOwnProduct ? (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
          <Text style={styles.soldLabel}>Sản phẩm của bạn</Text>
        </View>
      ) : sold ? (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
          <Text style={styles.soldLabel}>Sản phẩm đã bán</Text>
        </View>
      ) : isOutOfStock ? (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
          <Text style={styles.soldLabel}>Hết hàng</Text>
        </View>
      ) : (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            onPress={handleChat}
            style={styles.chatButton}>
            <MaterialIcons name="chat" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleFavorite(product.id)}
            style={[styles.roundButton, favorite && styles.roundButtonActive]}>
            <MaterialIcons
              name={favorite ? 'favorite' : 'favorite-border'}
              size={22}
              color={favorite ? colors.error : colors.onSurface}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              addToCart(product.id);
              Alert.alert('Đã thêm vào giỏ', 'Sản phẩm đã được thêm vào giỏ hàng của bạn.');
            }}
            style={styles.addCartIconButton}>
            <MaterialIcons name="add-shopping-cart" size={22} color={colors.primary} />
          </TouchableOpacity>
          <Button
            title="Mua ngay"
            icon="arrow-forward"
            size="sm"
            style={styles.buyButton}
            onPress={handleBuyNow}
          />
        </View>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingHorizontal: 12,
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 20,
  },
  headerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248,249,255,0.95)',
    ...shadow.level1,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
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
  headerTitle: {
    ...typography.headlineMdMobile,
    color: colors.primary,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  headerAddressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  headerAddress: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    maxWidth: 180,
  },
  carousel: {
    backgroundColor: colors.surfaceVariant,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    height: 400,
    overflow: 'hidden',
  },
  pagination: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: radius.full,
    bottom: 14,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: 'absolute',
  },
  dot: {
    backgroundColor: 'rgba(11,28,48,0.3)',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  content: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 10,
    padding: 16,
    ...shadow.level1,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontWeight: '700',
  },
  price: {
    ...typography.displayLgMobile,
    color: colors.primary,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipPrimary: {
    backgroundColor: 'rgba(0,74,198,0.1)',
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipPrimaryText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  chipSecondary: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,88,190,0.1)',
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipSecondaryText: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '500',
  },
  sellerCard: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 16,
    ...shadow.level1,
  },
  sellerCardInner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  sellerInfo: {
    flex: 1,
    gap: 2,
  },
  sellerNameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  sellerName: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontSize: 17,
  },
  sellerUni: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
  },
  sellerTrust: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: 6,
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sellerTrustText: {
    color: colors.star,
    fontSize: 12,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 10,
    padding: 16,
    ...shadow.level1,
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontSize: 17,
  },
  description: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
  },
  meetup: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: '500',
  },
  distance: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
  },
  codCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,98,41,0.06)',
    borderColor: 'rgba(0,98,41,0.15)',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  codInfo: {
    flex: 1,
    gap: 2,
  },
  codTitle: {
    color: colors.tertiary,
    fontSize: 14,
    fontWeight: '600',
  },
  codText: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
  },
  reportBtn: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 8,
  },
  reportText: {
    color: colors.outline,
    fontSize: 14,
    fontWeight: '500',
  },
  bottomBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.94)',
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: 8,
    left: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    position: 'absolute',
    right: 0,
    ...shadow.level3,
  },
  roundButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.md,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  roundButtonActive: {
    backgroundColor: colors.errorContainer,
  },
  chatButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderColor: 'rgba(0,74,198,0.2)',
    borderRadius: radius.md,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  addCartIconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderColor: 'rgba(0,74,198,0.2)',
    borderRadius: radius.md,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  buyButton: {
    flex: 1,
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
  soldLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 14,
    textAlign: 'center',
    width: '100%',
  },
  stockInfo: {
    backgroundColor: 'rgba(248,249,255,0.9)',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
    ...shadow.level1,
  },
  stockText: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontWeight: '700',
  },
  stockOutOfText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
