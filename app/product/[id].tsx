import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocationPreview } from '@/src/components/location-preview';
import { EmptyState, PrimaryButton, SectionHeading } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, shadow } from '@/src/theme/colors';
import { formatCurrency, formatDate } from '@/src/utils/format';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    currentUser,
    products,
    cart,
    favoriteIds,
    addToCart,
    toggleFavorite,
    getUserById,
  } = useStore();
  const product = products.find((item) => item.id === id);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState
          description="Tin đăng này có thể đã được người bán xóa."
          icon="cube-outline"
          title="Không tìm thấy sản phẩm"
        />
      </SafeAreaView>
    );
  }

  const selectedProduct = product;
  const seller = getUserById(product.sellerId);
  const isBuyer = currentUser?.role === 'buyer';
  const isOwner = currentUser?.id === product.sellerId;
  const isFavorite = favoriteIds.includes(product.id);
  const cartQuantity = cart.find((item) => item.productId === product.id)?.quantity ?? 0;
  const unavailable = product.status === 'sold' || product.stock === 0;

  function handleAddToCart() {
    if (!addToCart(selectedProduct.id)) {
      Alert.alert('Chưa thể thêm', 'Sản phẩm đã hết hàng hoặc tài khoản không phù hợp.');
      return;
    }
    Alert.alert('Đã thêm vào giỏ', `${selectedProduct.title} đã có trong giỏ hàng.`, [
      { text: 'Mua tiếp', style: 'cancel' },
      { text: 'Xem giỏ', onPress: () => router.push('/cart') },
    ]);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity accessibilityLabel="Quay lại" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Chi tiết sản phẩm</Text>
        <TouchableOpacity
          accessibilityLabel="Yêu thích"
          onPress={() => toggleFavorite(product.id)}
          style={styles.iconButton}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? colors.accent : colors.ink}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <Image contentFit="cover" source={{ uri: product.image }} style={styles.heroImage} />
          {unavailable && (
            <View style={styles.soldBanner}>
              <Text style={styles.soldBannerText}>Sản phẩm đã bán</Text>
            </View>
          )}
        </View>

        <View style={styles.mainInfo}>
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{product.category}</Text>
            </View>
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionBadgeText}>{product.condition}</Text>
            </View>
          </View>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          <View style={styles.inventoryRow}>
            <Ionicons name="layers-outline" size={17} color={colors.inkMuted} />
            <Text style={styles.inventoryText}>Còn {product.stock} sản phẩm</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.inventoryText}>Đăng ngày {formatDate(product.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeading title="Mô tả" />
          <Text style={styles.description}>{product.description}</Text>
        </View>

        <View style={styles.section}>
          <SectionHeading title="Người bán" />
          <View style={styles.sellerCard}>
            <Image
              contentFit="cover"
              source={{ uri: seller?.avatar ?? '' }}
              style={styles.avatar}
            />
            <View style={styles.sellerInfo}>
              <View style={styles.sellerNameRow}>
                <Text style={styles.sellerName}>{seller?.name ?? 'Người bán UniLoop'}</Text>
                {seller?.verified && (
                  <Ionicons name="checkmark-circle" size={17} color={colors.primary} />
                )}
              </View>
              <Text style={styles.campus}>{seller?.campus}</Text>
              <Text style={styles.phone}>{seller?.phone}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeading title="Điểm hẹn nhận hàng" />
          <LocationPreview location={product.location} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {isBuyer ? (
          <>
            <TouchableOpacity
              accessibilityLabel="Mở giỏ hàng"
              onPress={() => router.push('/cart')}
              style={styles.cartButton}>
              <Ionicons name="bag-handle-outline" size={22} color={colors.primary} />
              {cartQuantity > 0 && <Text style={styles.cartQuantity}>{cartQuantity}</Text>}
            </TouchableOpacity>
            <PrimaryButton
              disabled={unavailable || cartQuantity >= product.stock}
              icon="bag-add-outline"
              onPress={handleAddToCart}
              style={styles.flexButton}
              title={unavailable ? 'Đã bán' : 'Thêm vào giỏ'}
            />
          </>
        ) : isOwner ? (
          <PrimaryButton
            icon="create-outline"
            onPress={() =>
              router.push({ pathname: '/product/edit/[id]', params: { id: product.id } })
            }
            style={styles.flexButton}
            title="Chỉnh sửa sản phẩm"
          />
        ) : (
          <View style={styles.sellerNotice}>
            <Ionicons name="information-circle" size={19} color={colors.primary} />
            <Text style={styles.sellerNoticeText}>Bạn đang xem bằng tài khoản người bán.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  topBar: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  topTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  content: { paddingBottom: 110 },
  heroWrap: { backgroundColor: colors.primarySoft, height: 330, position: 'relative' },
  heroImage: { height: '100%', width: '100%' },
  soldBanner: {
    backgroundColor: colors.ink,
    bottom: 14,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
  },
  soldBannerText: { color: colors.white, fontSize: 13, fontWeight: '900' },
  mainInfo: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    padding: 18,
  },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 11 },
  categoryBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  categoryBadgeText: { color: colors.primaryDark, fontSize: 11, fontWeight: '800' },
  conditionBadge: {
    backgroundColor: colors.warningSoft,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  conditionBadgeText: { color: colors.warning, fontSize: 11, fontWeight: '800' },
  productTitle: { color: colors.ink, fontSize: 23, fontWeight: '900', lineHeight: 29 },
  price: { color: colors.accent, fontSize: 25, fontWeight: '900', marginTop: 10 },
  inventoryRow: { alignItems: 'center', flexDirection: 'row', marginTop: 12 },
  inventoryText: { color: colors.inkMuted, fontSize: 12 },
  dot: { color: colors.borderStrong, marginHorizontal: 7 },
  section: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    marginTop: 10,
    padding: 18,
  },
  description: { color: colors.inkMuted, fontSize: 14, lineHeight: 22 },
  sellerCard: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    flexDirection: 'row',
    padding: 12,
  },
  avatar: { backgroundColor: colors.primarySoft, borderRadius: 8, height: 58, width: 58 },
  sellerInfo: { flex: 1, marginLeft: 12 },
  sellerNameRow: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  sellerName: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  campus: { color: colors.inkMuted, fontSize: 12, marginTop: 4 },
  phone: { color: colors.primaryDark, fontSize: 12, fontWeight: '700', marginTop: 3 },
  bottomBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    left: 0,
    padding: 12,
    position: 'absolute',
    right: 0,
    ...shadow,
  },
  cartButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    position: 'relative',
    width: 52,
  },
  cartQuantity: {
    backgroundColor: colors.accent,
    borderRadius: 7,
    color: colors.white,
    fontSize: 9,
    fontWeight: '900',
    minWidth: 15,
    paddingHorizontal: 4,
    paddingVertical: 2,
    position: 'absolute',
    right: 5,
    textAlign: 'center',
    top: 4,
  },
  flexButton: { flex: 1 },
  sellerNotice: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  sellerNoticeText: { color: colors.primaryDark, flex: 1, fontSize: 13 },
});
