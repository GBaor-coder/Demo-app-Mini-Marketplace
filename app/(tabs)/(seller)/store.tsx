import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/Avatar';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { formatCurrency } from '@/src/utils/format';

export default function SellerStoreTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, products, orders } = useStore();

  if (!currentUser) {
    return null;
  }

  const myProducts = products.filter(
    (p) => p.sellerId === currentUser.id && p.status === 'active'
  );
  const soldCount = orders.filter(
    (o) => o.sellerId === currentUser.id && o.status === 'completed'
  ).length;
  const rating = currentUser.rating ?? 4.8;

  const renderItem = ({ item }: { item: (typeof myProducts)[number] }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/product/${item.id}`)}
      style={styles.productCard}>
      <Image
        contentFit="cover"
        source={{ uri: item.images?.[0] || item.image }}
        style={styles.productImage}
      />
      <Text numberOfLines={2} style={styles.productTitle}>
        {item.title}
      </Text>
      <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.brand}>UniLoop</Text>
      </View>

      <FlatList
        data={myProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListHeaderComponent={
          <View>
            <View style={styles.shopHeader}>
              <View style={styles.shopTop}>
                <Avatar uri={currentUser.avatar} name={currentUser.name} size={72} />
                <View style={styles.shopInfo}>
                  <Text style={styles.shopName}>{currentUser.name}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.onPrimary} />
                      <Text style={styles.verifiedText}>Đã xác thực</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={13} color="#F59E0B" />
                      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                    </View>
                  </View>
                  <Text style={styles.campus}>
                    <Ionicons name="location-outline" size={12} color={colors.onSurfaceVariant} />{' '}
                    {currentUser.campus}
                  </Text>
                </View>
              </View>
              <Text style={styles.shopDesc}>
                Chào mừng bạn đến với cửa hàng của mình. Cảm ơn vì đã ghé thăm!
              </Text>
            </View>

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{myProducts.length}</Text>
                <Text style={styles.statLabel}>Sản phẩm</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{soldCount}</Text>
                <Text style={styles.statLabel}>Đã bán</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatCurrency(4.8).slice(0, 4)}</Text>
                <Text style={styles.statLabel}>Đánh giá</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sản phẩm đang bán</Text>
              <Text style={styles.sectionCount}>{myProducts.length} tin</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="storefront-outline" size={56} color={colors.surfaceDim} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có sản phẩm nào</Text>
            <Text style={styles.emptyText}>
              Hãy đăng sản phẩm đầu tiên để bắt đầu bán trên UniLoop.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/(seller)/create')}
              style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Đăng sản phẩm</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: 'rgba(248,249,255,0.92)',
    paddingBottom: 10,
    paddingHorizontal: 20,
    ...shadow.level1,
  },
  brand: {
    ...typography.headlineMd,
    color: colors.primary,
    fontSize: 22,
  },
  list: {
    gap: 16,
    padding: 20,
  },
  row: {
    gap: 16,
  },
  shopHeader: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['3xl'],
    gap: 16,
    padding: 20,
    ...shadow.level1,
  },
  shopTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  shopInfo: {
    flex: 1,
    gap: 8,
  },
  shopName: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontSize: 20,
  },
  badgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  verifiedBadge: {
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  verifiedText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  ratingBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,126,55,0.12)',
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ratingText: {
    color: colors.tertiaryContainer,
    fontSize: 12,
    fontWeight: '700',
  },
  campus: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  shopDesc: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  stats: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
    flexDirection: 'row',
    marginTop: 16,
    paddingVertical: 16,
    ...shadow.level1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  statValue: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontSize: 20,
  },
  statLabel: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  statDivider: {
    backgroundColor: 'rgba(195,198,215,0.4)',
    height: 32,
    width: 1,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    marginTop: 24,
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontSize: 18,
  },
  sectionCount: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
  },
  productCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
    flex: 1,
    gap: 4,
    overflow: 'hidden',
    paddingBottom: 12,
    ...shadow.level1,
  },
  productImage: {
    backgroundColor: colors.surfaceContainerHighest,
    height: 150,
    width: '100%',
  },
  productTitle: {
    ...typography.bodyMd,
    color: colors.onSurface,
    marginHorizontal: 12,
    marginTop: 4,
  },
  productPrice: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '700',
    marginHorizontal: 12,
    marginTop: 2,
  },
  emptyWrap: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(220,233,255,0.6)',
    borderRadius: radius.full,
    height: 120,
    justifyContent: 'center',
    marginBottom: 8,
    width: 120,
  },
  emptyTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    maxWidth: 280,
    textAlign: 'center',
  },
  emptyBtn: {
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  emptyBtnText: {
    ...typography.button,
    color: colors.onPrimary,
  },
});
