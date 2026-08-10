import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/Avatar';
import { Button, EmptyState } from '@/src/components/ui';
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
    getUserById,
    favoriteIds,
    toggleFavorite,
    addToCart,
    startChat,
    currentUser,
  } = useStore();
  const [imageIndex, setImageIndex] = useState(0);

  const product = products.find((p) => p.id === id);
  const seller = product ? getUserById(product.sellerId) : undefined;

  if (!product) {
    return (
      <View style={styles.screen}>
        <EmptyState icon="cube-outline" title="Không tìm thấy sản phẩm" description="Sản phẩm này có thể đã bị xóa." />
      </View>
    );
  }

  const images = product.images?.length ? product.images : [product.image];
  const favorite = favoriteIds.includes(product.id);
  const sold = product.status === 'sold';

  const handleBuyNow = () => {
    if (currentUser?.role !== 'buyer') {
      return;
    }
    addToCart(product.id);
    router.push('/cart');
  };

  const handleChat = () => {
    const threadId = startChat(product.sellerId, product.id);
    if (threadId) {
      router.push(`/chat/${threadId}`);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}>
            <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-social-outline" size={22} color={colors.onSurface} />
          </TouchableOpacity>
        </View>

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
          <View style={styles.detailCard}>
            <Text style={styles.title}>{product.title}</Text>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            <View style={styles.chips}>
              <View style={styles.chipPrimary}>
                <Text style={styles.chipPrimaryText}>Tình trạng: {product.condition}</Text>
              </View>
              <View style={styles.chipSecondary}>
                <Ionicons name="pricetag-outline" size={14} color={colors.secondary} />
                <Text style={styles.chipSecondaryText}>{product.category}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleChat}
            style={styles.sellerCard}>
            <Avatar uri={seller?.avatar} name={seller?.name} size={56} />
            <View style={styles.sellerInfo}>
              <View style={styles.sellerNameRow}>
                <Text style={styles.sellerName}>{seller?.name ?? 'Người bán'}</Text>
                {seller?.verified ? (
                  <Ionicons name="shield-checkmark" size={18} color={colors.tertiaryFixedDim} />
                ) : null}
              </View>
              <Text style={styles.sellerUni}>{seller?.campus ?? ''}</Text>
              <View style={styles.sellerTrust}>
                <Ionicons name="star" size={13} color={colors.tertiary} />
                <Text style={styles.sellerTrustText}>Người bán uy tín</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.outline} />
          </TouchableOpacity>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeading}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            </View>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeading}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
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
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map-outline" size={40} color={colors.outlineVariant} />
            </View>
          </View>

          {product.allowsCod ? (
            <View style={styles.codCard}>
              <Ionicons name="cash-outline" size={20} color={colors.tertiary} />
              <View style={styles.codInfo}>
                <Text style={styles.codTitle}>Hỗ trợ giao hàng COD</Text>
                <Text style={styles.codText}>Phí ship 15.000đ cho nội khu Làng Đại học</Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {sold ? (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
          <Text style={styles.soldLabel}>Sản phẩm đã bán</Text>
        </View>
      ) : (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            onPress={() => toggleFavorite(product.id)}
            style={[styles.roundButton, favorite && styles.roundButtonActive]}>
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={22}
              color={favorite ? '#e11d48' : colors.onSurface}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleChat} style={styles.chatButton}>
            <Ionicons name="chatbubble-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <Button
            title="Thêm giỏ"
            variant="secondary"
            style={styles.addCartButton}
            compact
            onPress={() => {
              if (currentUser?.role !== 'buyer') {
                return;
              }
              addToCart(product.id);
              router.push('/cart');
            }}
          />
          <Button
            title="Mua ngay"
            icon="arrow-forward"
            style={styles.buyButton}
            compact
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
    backgroundColor: 'rgba(248,249,255,0.92)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingHorizontal: 12,
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 20,
  },
  headerButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    ...typography.headlineSm,
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
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
    borderRadius: radius.lg,
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
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    ...shadow.level1,
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
    backgroundColor: 'rgba(0,98,41,0.1)',
    borderRadius: 6,
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sellerTrustText: {
    color: colors.tertiary,
    fontSize: 12,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.lg,
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
  },  mapPlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderColor: 'rgba(195,198,215,0.2)',
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 160,
    justifyContent: 'center',
  },
  codCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,98,41,0.06)',
    borderColor: 'rgba(0,98,41,0.15)',
    borderRadius: radius.xl,
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
  },
  roundButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.lg,
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
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  addCartButton: {
    flex: 1,
  },
  buyButton: {
    flex: 1.5,
  },
  soldLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 14,
    textAlign: 'center',
    width: '100%',
  },
});
