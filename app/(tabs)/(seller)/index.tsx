import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button, MaterialIcons, ScreenHeader, StatusBadge } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { formatCurrency } from '@/src/utils/format';

export default function SellerOverviewScreen() {
  const router = useRouter();
  const { currentUser, products, orders, getUserById } = useStore();

  if (!currentUser) {
    return null;
  }

  const myProducts = products.filter((p) => p.sellerId === currentUser.id);
  const activeCount = myProducts.filter((p) => p.status === 'active').length;
  const myOrders = orders.filter((o) => o.sellerId === currentUser.id);
  const pendingOrders = myOrders.filter((o) => o.status === 'pending').length;
  const revenue = myOrders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);
  const recentOrders = myOrders.slice(0, 4);

  return (
    <View style={styles.screen}>
      <ScreenHeader brand showBack={false} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Chào, {currentUser.name.split(' ')[0]}! 👋</Text>
        <Text style={styles.greetingSub}>Đây là tổng quan cửa hàng của bạn hôm nay.</Text>

        <View style={styles.stats}>
          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={styles.statLabel}>Tổng sản phẩm</Text>
              <MaterialIcons name="inventory-2" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.statValue}>{myProducts.length}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={styles.statLabel}>Tin đang bán</Text>
              <MaterialIcons name="campaign" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.statValue}>{activeCount}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardHighlight]}>
            <View style={styles.statTop}>
              <Text style={[styles.statLabel, styles.statLabelLight]}>Đơn chờ xử lý</Text>
              <MaterialIcons name="pending-actions" size={20} color={colors.onPrimary} />
            </View>
            <Text style={[styles.statValue, styles.statValueLight]}>{pendingOrders}</Text>
            <Text style={[styles.statHint, styles.statHintLight]}>Cần xử lý ngay!</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={styles.statLabel}>Doanh thu (VND)</Text>
              <MaterialIcons name="account-balance-wallet" size={20} color={colors.tertiaryContainer} />
            </View>
            <Text style={styles.statValue}>
              {revenue >= 1000000
                ? `${(revenue / 1000000).toFixed(1)}M`
                : formatCurrency(revenue)}
            </Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Button
            title="Đăng sản phẩm mới"
            icon="add"
            size="lg"
            fullWidth
            onPress={() => router.push('/product-form')}
          />
          <View style={styles.quickGrid}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/(seller)/orders')}
              style={styles.quickItem}>
              <MaterialIcons name="receipt-long" size={26} color={colors.primary} />
              <Text style={styles.quickText}>Quản lý đơn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/(seller)/products')}
              style={styles.quickItem}>
              <MaterialIcons name="warehouse" size={26} color={colors.secondary} />
              <Text style={styles.quickText}>Kho hàng</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.orderCard}>
          <View style={styles.orderCardHeader}>
            <Text style={styles.orderCardTitle}>Đơn hàng gần đây</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/(seller)/orders')}>
              <Text style={styles.sectionLink}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.length === 0 ? (
            <View style={styles.noOrders}>
              <MaterialIcons name="receipt-long" size={36} color={colors.outline} />
              <Text style={styles.noOrdersText}>Chưa có đơn hàng nào</Text>
            </View>
          ) : (
            <View>
              {recentOrders.map((order, index) => {
                const item = order.items[0];
                return (
                  <TouchableOpacity
                    key={order.id}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/seller-order/${order.id}`)}
                    style={[
                      styles.orderRow,
                      index < recentOrders.length - 1 && styles.orderRowBorder,
                    ]}>
                    <View style={styles.orderNumberBox}>
                      <Text style={styles.orderNumberText}>#{order.id.slice(-3)}</Text>
                    </View>
                    <View style={styles.orderInfo}>
                      <Text numberOfLines={1} style={styles.orderProduct}>
                        {item?.title}
                      </Text>
                      <Text style={styles.orderBuyer}>
                        Người mua: {getUserById(order.buyerId)?.name ?? order.buyerId}
                      </Text>
                    </View>
                    <View style={styles.orderRight}>
                      <Text style={styles.orderPrice}>{formatCurrency(order.total)}</Text>
                      <StatusBadge status={order.status} small style={styles.orderBadge} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sản phẩm của bạn</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/(seller)/products')}>
            <Text style={styles.sectionLink}>Quản lý</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productStrip}>
          {myProducts.slice(0, 6).map((product) => (
            <TouchableOpacity
              key={product.id}
              activeOpacity={0.85}
              onPress={() => router.push(`/product-form?id=${product.id}`)}
              style={styles.productMini}>
               <Image
                 contentFit="cover"
                 source={{ uri: product.images?.[0] || product.image }}
                 style={styles.productMiniImage}
               />
              <View style={styles.productMiniBody}>
                <Text numberOfLines={1} style={styles.productMiniTitle}>
                  {product.title}
                </Text>
                <Text style={styles.productMiniPrice}>
                  {formatCurrency(product.price)}
                </Text>
                <Text style={styles.productMiniStock}>
                  {product.status === 'sold' ? 'Đã bán' : `Tồn kho: ${product.stock}`}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 32,
  },
  greeting: {
    ...typography.displayLgMobile,
    color: colors.onSurface,
    fontSize: 26,
    marginTop: 4,
  },
  greetingSub: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: 16,
    width: '48%',
    ...shadow.level1,
  },
  statCardHighlight: {
    backgroundColor: colors.primaryContainer,
  },
  statTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statValue: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontSize: 22,
  },
  statValueLight: {
    color: colors.onPrimary,
  },
  statLabel: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  statLabelLight: {
    color: 'rgba(238,239,255,0.9)',
  },
  statHint: {
    color: colors.tertiaryContainer,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  statHintLight: {
    color: colors.onPrimaryContainer,
    opacity: 0.9,
  },
  quickActions: {
    gap: 12,
    marginTop: 20,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickItem: {
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    borderRadius: radius.lg,
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    minHeight: 96,
  },
  quickText: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 24,
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontSize: 18,
  },
  sectionLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  orderCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.level1,
  },
  orderCardHeader: {
    alignItems: 'center',
    borderBottomColor: 'rgba(195,198,215,0.3)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  orderCardTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontSize: 18,
  },
  orderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  orderRowBorder: {
    borderBottomColor: 'rgba(195,198,215,0.2)',
    borderBottomWidth: 1,
  },
  orderNumberBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  orderNumberText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  orderInfo: {
    flex: 1,
    gap: 2,
  },
  orderProduct: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '500',
  },
  orderBuyer: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  orderPrice: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '600',
  },
  orderBadge: {
    alignSelf: 'flex-end',
  },
  productStrip: {
    gap: 12,
  },
  productMini: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    overflow: 'hidden',
    width: 140,
    ...shadow.level1,
  },
  productMiniImage: {
    height: 110,
    width: '100%',
  },
  productMiniBody: {
    padding: 10,
  },
  productMiniTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  productMiniPrice: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  productMiniStock: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 2,
  },
  noOrders: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    gap: 8,
    padding: 24,
    ...shadow.level1,
  },
  noOrdersText: {
    color: colors.onSurfaceVariant,
    fontSize: 15,
  },
});
