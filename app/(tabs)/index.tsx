import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/src/components/product-card';
import { BrandMark, EmptyState, PrimaryButton, SectionHeading } from '@/src/components/ui';
import { CATEGORIES } from '@/src/data/seed';
import { useStore } from '@/src/context/store-context';
import { colors, shadow } from '@/src/theme/colors';
import { ProductCategory } from '@/src/types';
import { formatCurrency, normalizeSearch } from '@/src/utils/format';

type CategoryFilter = ProductCategory | 'Tất cả';

export default function HomeScreen() {
  const { currentUser } = useStore();
  return currentUser?.role === 'seller' ? <SellerDashboard /> : <BuyerMarketplace />;
}

function BuyerMarketplace() {
  const { products, cart, favoriteIds, toggleFavorite } = useStore();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('Tất cả');

  const filteredProducts = useMemo(() => {
    const needle = normalizeSearch(query);
    return products.filter((product) => {
      const matchesStatus = product.status === 'active' && product.stock > 0;
      const matchesCategory = category === 'Tất cả' || product.category === category;
      const haystack = normalizeSearch(`${product.title} ${product.category} ${product.description}`);
      return matchesStatus && matchesCategory && (!needle || haystack.includes(needle));
    });
  }, [category, products, query]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.listContent}
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            description="Hãy thử từ khóa hoặc danh mục khác."
            icon="search-outline"
            title="Chưa tìm thấy sản phẩm"
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <BrandMark compact />
              <TouchableOpacity
                accessibilityLabel="Mở giỏ hàng"
                onPress={() => router.push('/cart')}
                style={styles.headerIconButton}>
                <Ionicons name="bag-handle-outline" size={23} color={colors.ink} />
                {cart.length > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cart.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.welcomeBand}>
              <View style={styles.welcomeCopy}>
                <Text style={styles.eyebrow}>CHỢ QUANH TRƯỜNG</Text>
                <Text style={styles.welcomeTitle}>Tìm món cần, trao món dư</Text>
                <Text style={styles.welcomeText}>
                  Đồ cũ chất lượng, hẹn nhận gần và rõ người bán.
                </Text>
              </View>
              <View style={styles.welcomeIcon}>
                <Ionicons name="leaf" size={34} color={colors.primary} />
              </View>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color={colors.inkMuted} />
              <TextInput
                onChangeText={setQuery}
                placeholder="Tìm sách, đồ học tập, điện tử..."
                placeholderTextColor="#8B9A95"
                style={styles.searchInput}
                value={query}
              />
              {query.length > 0 && (
                <TouchableOpacity accessibilityLabel="Xóa tìm kiếm" onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.inkMuted} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              contentContainerStyle={styles.categoryContent}
              horizontal
              showsHorizontalScrollIndicator={false}>
              {(['Tất cả', ...CATEGORIES] as CategoryFilter[]).map((item) => {
                const active = item === category;
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setCategory(item)}
                    style={[styles.categoryChip, active && styles.categoryChipActive]}>
                    <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <SectionHeading
              action={<Text style={styles.resultCount}>{filteredProducts.length} sản phẩm</Text>}
              title="Gợi ý hôm nay"
            />
          </>
        }
        numColumns={2}
        renderItem={({ item }) => (
          <ProductCard
            favorite={favoriteIds.includes(item.id)}
            onPress={() =>
              router.push({ pathname: '/product/[id]', params: { id: item.id } })
            }
            onToggleFavorite={() => toggleFavorite(item.id)}
            product={item}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function SellerDashboard() {
  const {
    currentUser,
    products,
    orders,
    deleteProduct,
    markProductSold,
  } = useStore();
  const ownProducts = products.filter((product) => product.sellerId === currentUser?.id);
  const sellerOrders = orders.filter((order) => order.sellerId === currentUser?.id);
  const pendingOrders = sellerOrders.filter((order) => order.status === 'pending').length;
  const completedRevenue = sellerOrders
    .filter((order) => order.status === 'completed')
    .reduce((sum, order) => sum + order.total, 0);
  const activeProducts = ownProducts.filter((product) => product.status === 'active').length;

  function confirmDelete(id: string, title: string) {
    Alert.alert('Xóa sản phẩm?', `“${title}” sẽ bị xóa khỏi gian hàng.`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => deleteProduct(id) },
    ]);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.sellerContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BrandMark compact />
          <View style={styles.sellerRoleBadge}>
            <Ionicons name="shield-checkmark" size={15} color={colors.primary} />
            <Text style={styles.sellerRoleText}>Người bán</Text>
          </View>
        </View>

        <View style={styles.sellerWelcome}>
          <Text style={styles.sellerGreeting}>Chào {currentUser?.name.split(' ').slice(-2).join(' ')}</Text>
          <Text style={styles.sellerSubtitle}>Theo dõi gian hàng và xử lý đơn mới hôm nay.</Text>
        </View>

        <View style={styles.metricsBand}>
          <Metric icon="cube-outline" label="Đang bán" value={String(activeProducts)} />
          <Metric icon="time-outline" label="Chờ xác nhận" value={String(pendingOrders)} />
          <Metric
            icon="wallet-outline"
            label="Đã hoàn tất"
            value={formatCurrency(completedRevenue)}
          />
        </View>

        <PrimaryButton
          icon="add-circle-outline"
          onPress={() => router.push('/(tabs)/sell')}
          style={styles.createButton}
          title="Đăng sản phẩm mới"
        />

        <SectionHeading
          action={<Text style={styles.resultCount}>{ownProducts.length} tin</Text>}
          title="Sản phẩm của tôi"
        />

        {ownProducts.length === 0 ? (
          <EmptyState
            description="Đăng sản phẩm đầu tiên để bắt đầu gian hàng UniLoop."
            icon="storefront-outline"
            title="Gian hàng đang trống"
          />
        ) : (
          ownProducts.map((product) => (
            <View key={product.id} style={styles.sellerProduct}>
              <Image contentFit="cover" source={{ uri: product.image }} style={styles.sellerImage} />
              <View style={styles.sellerProductBody}>
                <View style={styles.sellerProductTop}>
                  <Text numberOfLines={2} style={styles.sellerProductTitle}>
                    {product.title}
                  </Text>
                  <View
                    style={[
                      styles.statusDot,
                      product.status === 'sold' && styles.statusDotSold,
                    ]}
                  />
                </View>
                <Text style={styles.sellerPrice}>{formatCurrency(product.price)}</Text>
                <Text style={styles.sellerStock}>
                  {product.status === 'sold' ? 'Đã bán' : `Còn ${product.stock} sản phẩm`}
                </Text>
                <View style={styles.sellerActions}>
                  <TouchableOpacity
                    accessibilityLabel="Sửa sản phẩm"
                    onPress={() =>
                      router.push({ pathname: '/product/edit/[id]', params: { id: product.id } })
                    }
                    style={styles.actionButton}>
                    <Ionicons name="create-outline" size={18} color={colors.blue} />
                  </TouchableOpacity>
                  {product.status === 'active' && (
                    <TouchableOpacity
                      accessibilityLabel="Đánh dấu đã bán"
                      onPress={() => markProductSold(product.id)}
                      style={styles.actionButton}>
                      <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    accessibilityLabel="Xóa sản phẩm"
                    onPress={() => confirmDelete(product.id, product.title)}
                    style={styles.actionButton}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text numberOfLines={1} style={styles.metricValue}>
        {value}
      </Text>
      <Text numberOfLines={1} style={styles.metricLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 28,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerIconButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    position: 'relative',
    width: 42,
  },
  cartBadge: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 8,
    height: 17,
    justifyContent: 'center',
    minWidth: 17,
    paddingHorizontal: 4,
    position: 'absolute',
    right: -5,
    top: -5,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
  },
  welcomeBand: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: '#CDE6DE',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 14,
    minHeight: 142,
    overflow: 'hidden',
    padding: 18,
  },
  welcomeCopy: {
    flex: 1,
  },
  eyebrow: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '900',
  },
  welcomeTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 27,
    marginTop: 7,
  },
  welcomeText: {
    color: colors.inkMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  welcomeIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    height: 74,
    justifyContent: 'center',
    marginLeft: 12,
    width: 66,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    marginBottom: 13,
    minHeight: 48,
    paddingHorizontal: 13,
  },
  searchInput: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
  },
  categoryContent: {
    gap: 8,
    paddingBottom: 21,
  },
  categoryChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  categoryChipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  categoryText: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  categoryTextActive: {
    color: colors.white,
  },
  resultCount: {
    color: colors.inkMuted,
    fontSize: 12,
  },
  productRow: {
    gap: 12,
    justifyContent: 'space-between',
  },
  sellerContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sellerRoleBadge: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  sellerRoleText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
  sellerWelcome: {
    marginBottom: 18,
  },
  sellerGreeting: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '900',
  },
  sellerSubtitle: {
    color: colors.inkMuted,
    fontSize: 14,
    marginTop: 5,
  },
  metricsBand: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 14,
    paddingVertical: 15,
    ...shadow,
  },
  metric: {
    alignItems: 'center',
    borderRightColor: colors.border,
    borderRightWidth: 1,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 5,
  },
  metricValue: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 5,
    maxWidth: '100%',
  },
  metricLabel: {
    color: colors.inkMuted,
    fontSize: 10,
    marginTop: 2,
    maxWidth: '100%',
  },
  createButton: {
    marginBottom: 25,
  },
  sellerProduct: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    minHeight: 126,
    overflow: 'hidden',
  },
  sellerImage: {
    backgroundColor: colors.primarySoft,
    height: 126,
    width: 112,
  },
  sellerProductBody: {
    flex: 1,
    padding: 11,
  },
  sellerProductTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  sellerProductTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  statusDot: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    height: 9,
    marginTop: 4,
    width: 9,
  },
  statusDotSold: {
    backgroundColor: colors.inkMuted,
  },
  sellerPrice: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 6,
  },
  sellerStock: {
    color: colors.inkMuted,
    fontSize: 11,
    marginTop: 3,
  },
  sellerActions: {
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 6,
    height: 31,
    justifyContent: 'center',
    width: 34,
  },
});
