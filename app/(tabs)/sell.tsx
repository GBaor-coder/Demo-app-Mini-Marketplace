import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { OrderStatus } from '@/src/types';
import { formatCurrency, ORDER_STATUS_LABELS } from '@/src/utils/format';

const STATUS_BADGE: Record<OrderStatus, { background: string; color: string }> = {
  pending: { background: colors.errorContainer, color: colors.onErrorContainer },
  confirmed: { background: 'rgba(0,74,198,0.1)', color: colors.primary },
  in_transaction: { background: 'rgba(0,74,198,0.1)', color: colors.primary },
  completed: { background: 'rgba(0,98,41,0.12)', color: colors.tertiaryContainer },
  cancelled: { background: colors.errorContainer, color: colors.onErrorContainer },
  rejected: { background: colors.errorContainer, color: colors.onErrorContainer },
};

export default function SellScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, products, orders, getUserById, switchRole } = useStore();

  if (!currentUser) {
    return null;
  }

  if (currentUser.role !== 'seller') {
    return (
      <View style={styles.screen}>
        <View style={styles.scroll}>
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <Text style={styles.brand}>UniLoop</Text>
          </View>
          <View style={styles.buyerCard}>
            <View style={styles.buyerIcon}>
              <Ionicons name="storefront" size={44} color={colors.primary} />
            </View>
            <Text style={styles.buyerTitle}>Kênh người bán</Text>
            <Text style={styles.buyerText}>
              Đăng bán đồ cũ, giáo trình đã qua sử dụng và kiếm thêm thu nhập từ
              cộng đồng sinh viên.
            </Text>
            <Button
              title="Bắt đầu bán ngay"
              icon="arrow-forward"
              size="lg"
              fullWidth
              onPress={() => {
                switchRole();
                router.push('/product-form');
              }}
            />
          </View>
        </View>
      </View>
    );
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
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.brand}>UniLoop</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Chào, {currentUser.name.split(' ')[0]}! 👋</Text>
        <Text style={styles.greetingSub}>Đây là tổng quan cửa hàng của bạn hôm nay.</Text>

        <View style={styles.stats}>
          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={styles.statLabel}>Tổng sản phẩm</Text>
              <Ionicons name="cube-outline" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.statValue}>{myProducts.length}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={styles.statLabel}>Tin đang bán</Text>
              <Ionicons name="megaphone-outline" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.statValue}>{activeCount}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardHighlight]}>
            <View style={styles.statTop}>
              <Text style={[styles.statLabel, styles.statLabelLight]}>Đơn chờ xử lý</Text>
              <Ionicons name="time-outline" size={20} color={colors.onPrimary} />
            </View>
            <Text style={[styles.statValue, styles.statValueLight]}>{pendingOrders}</Text>
            <Text style={[styles.statHint, styles.statHintLight]}>Cần xử lý ngay!</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <Text style={styles.statLabel}>Doanh thu (VND)</Text>
              <Ionicons name="cash-outline" size={20} color={colors.tertiaryContainer} />
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
              onPress={() => router.push('/seller-orders')}
              style={styles.quickItem}>
              <Ionicons name="cube" size={26} color={colors.primary} />
              <Text style={styles.quickText}>Quản lý đơn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/seller-products')}
              style={styles.quickItem}>
              <Ionicons name="albums-outline" size={26} color={colors.secondary} />
              <Text style={styles.quickText}>Kho hàng</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.orderCard}>
          <View style={styles.orderCardHeader}>
            <Text style={styles.orderCardTitle}>Đơn hàng gần đây</Text>
            <TouchableOpacity onPress={() => router.push('/seller-orders')}>
              <Text style={styles.sectionLink}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.length === 0 ? (
            <View style={styles.noOrders}>
              <Ionicons name="receipt-outline" size={36} color={colors.outline} />
              <Text style={styles.noOrdersText}>Chưa có đơn hàng nào</Text>
            </View>
          ) : (
            <View>
              {recentOrders.map((order, index) => {
                const item = order.items[0];
                const badge = STATUS_BADGE[order.status];
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
                      <View style={[styles.orderBadge, { backgroundColor: badge.background }]}>
                        <Text style={[styles.orderBadgeText, { color: badge.color }]}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sản phẩm của bạn</Text>
          <TouchableOpacity onPress={() => router.push('/seller-products')}>
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
    borderRadius: radius['2xl'],
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
    borderRadius: radius.xl,
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
    borderRadius: radius['2xl'],
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
    borderRadius: radius.lg,
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
    gap: 2,
  },
  orderPrice: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '600',
  },
  orderBadge: {
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  orderBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  productStrip: {
    gap: 12,
  },
  productMini: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
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
  buyerCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['3xl'],
    marginTop: 32,
    padding: 28,
    ...shadow.level1,
  },
  buyerIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderRadius: radius.full,
    height: 88,
    justifyContent: 'center',
    marginBottom: 16,
    width: 88,
  },
  buyerTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  buyerText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 24,
    marginTop: 8,
    textAlign: 'center',
  },
  noOrders: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
    gap: 8,
    padding: 24,
    ...shadow.level1,
  },
  noOrdersText: {
    color: colors.onSurfaceVariant,
    fontSize: 15,
  },
});
