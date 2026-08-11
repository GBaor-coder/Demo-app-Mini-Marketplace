import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button, IconName, MaterialIcons, ScreenHeader } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { formatCurrency } from '@/src/utils/format';

const TIPS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'photo-camera',
    title: 'Ảnh rõ nét',
    body: 'Chụp ảnh đầy đủ, ánh sáng tốt để sản phẩm thu hút hơn.',
  },
  {
    icon: 'local-offer',
    title: 'Giá hợp lý',
    body: 'Tham khảo mặt bằng giá để đưa ra mức giá cạnh tranh.',
  },
  {
    icon: 'chat',
    title: 'Trả lời nhanh',
    body: 'Phản hồi tin nhắn sớm giúp chốt giao dịch nhanh hơn.',
  },
];

export default function SellerCreateTab() {
  const router = useRouter();
  const { currentUser, products } = useStore();

  const myProducts = currentUser
    ? products.filter((p) => p.sellerId === currentUser.id).slice(0, 3)
    : [];

  return (
    <View style={styles.screen}>
      <ScreenHeader brand showBack={false} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Đăng bán</Text>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialIcons name="add-circle" size={48} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Tạo tin đăng mới</Text>
          <Text style={styles.heroBody}>
            Bán đồ cũ, sách giáo trình hay bất kỳ món đồ nào bạn không còn dùng tới.
          </Text>
          <Button
            title="Đăng sản phẩm mới"
            icon="add"
            size="lg"
            fullWidth
            onPress={() => router.push('/product-form')}
          />
        </View>

        <View style={styles.tips}>
          <Text style={styles.sectionTitle}>Mẹo để bán nhanh</Text>
          {TIPS.map((tip, index) => (
            <View key={tip.title} style={styles.tipRow}>
              <View style={styles.tipIcon}>
                <MaterialIcons name={tip.icon} size={22} color={colors.primary} />
              </View>
              <View style={styles.tipInfo}>
                <Text style={styles.tipTitle}>
                  {index + 1}. {tip.title}
                </Text>
                <Text style={styles.tipBody}>{tip.body}</Text>
              </View>
            </View>
          ))}
        </View>

        {myProducts.length > 0 ? (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tin gần đây</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/(seller)/products')}>
                <Text style={styles.sectionLink}>Quản lý</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recent}>
              {myProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/product-form?id=${product.id}`)}
                  style={styles.recentItem}>
                  <Image
                    contentFit="cover"
                    source={{ uri: product.images?.[0] || product.image }}
                    style={styles.recentImage}
                  />
                  <View style={styles.recentInfo}>
                    <Text numberOfLines={1} style={styles.recentTitle}>
                      {product.title}
                    </Text>
                    <Text style={styles.recentPrice}>{formatCurrency(product.price)}</Text>
                  </View>
                  <MaterialIcons name="edit" size={20} color={colors.secondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}
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
  pageTitle: {
    ...typography.displayLgMobile,
    color: colors.onSurface,
    fontSize: 24,
    marginTop: 4,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
    gap: 12,
    padding: 24,
    ...shadow.level1,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderRadius: radius.full,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  heroTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontSize: 20,
  },
  heroBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 8,
    textAlign: 'center',
  },
  tips: {
    marginTop: 24,
    gap: 12,
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
  tipRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  tipIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(33,112,228,0.1)',
    borderRadius: radius.lg,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  tipInfo: {
    flex: 1,
    gap: 2,
  },
  tipTitle: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '600',
  },
  tipBody: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  recent: {
    gap: 8,
  },
  recentItem: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    ...shadow.level1,
  },
  recentImage: {
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: radius.md,
    height: 56,
    width: 56,
  },
  recentInfo: {
    flex: 1,
    gap: 2,
  },
  recentTitle: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '500',
  },
  recentPrice: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
