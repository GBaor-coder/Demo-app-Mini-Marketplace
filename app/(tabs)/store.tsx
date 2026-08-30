import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Avatar } from '@/src/components/Avatar';
import { Button, LogoutModal, MaterialIcons, ScreenHeader } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { formatCurrency } from '@/src/utils/format';

export default function SellerStoreTab() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const { currentUser, products, orders, logout, getUserById, ensureProfile, startChat } =
    useStore();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const visitingOther = Boolean(userId && currentUser && userId !== currentUser.id);

  const otherOwner = useMemo(
    () => (visitingOther && userId ? getUserById(userId) : undefined),
    [visitingOther, userId, getUserById]
  );

  useEffect(() => {
    if (userId && currentUser && userId !== currentUser.id) {
      void ensureProfile(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentUser?.id]);

  if (!currentUser) {
    return null;
  }

  if (visitingOther && !otherOwner) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Cửa hàng" showBack />
        <View style={styles.loadingWrap}>
          <MaterialIcons name="storefront" size={56} color={colors.outlineVariant} />
          <Text style={styles.loadingText}>Đang tải thông tin cửa hàng...</Text>
        </View>
      </View>
    );
  }

  const owner = visitingOther ? otherOwner! : currentUser;
  const isOwnStore = owner.id === currentUser.id;

  const openChat = async () => {
    if (isOwnStore) return;
    const threadId = await startChat(owner.id);
    if (threadId) {
      router.push(`/chat/${threadId}`);
    }
  };

  const selling = products.filter((p) => p.sellerId === owner.id && p.status === 'active');
  const soldCount = orders.filter(
    (o) => o.sellerId === owner.id && o.status === 'completed'
  ).length;
  const rating = owner.rating ?? 4.8;

  const renderItem = ({ item }: { item: (typeof selling)[number] }) => (
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
      {isOwnStore ? (
        <ScreenHeader brand showBack={false} />
      ) : (
        <ScreenHeader title="Cửa hàng" showBack />
      )}

      <FlatList
        data={selling}
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
                <Avatar uri={owner.avatar} name={owner.name} size={72} />
                <View style={styles.shopInfo}>
                  <Text style={styles.shopName}>{owner.name}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.verifiedBadge}>
                      <MaterialIcons name="check-circle" size={14} color={colors.onPrimary} />
                      <Text style={styles.verifiedText}>Đã xác thực</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <MaterialIcons name="star" size={13} color="#F59E0B" />
                      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                    </View>
                  </View>
                  <Text style={styles.campus}>
                    <MaterialIcons name="location-on" size={12} color={colors.onSurfaceVariant} />{' '}
                    {owner.campus}
                  </Text>
                </View>
              </View>
              <Text style={styles.shopDesc}>
                {isOwnStore
                  ? 'Chào mừng bạn đến với cửa hàng của mình. Cảm ơn vì đã ghé thăm!'
                  : `Cửa hàng của ${owner.name} trên UniLoop. Nhắn tin để trao đổi trực tiếp.`}
              </Text>
            </View>

            {isOwnStore ? null : (
              <TouchableOpacity activeOpacity={0.9} onPress={openChat} style={styles.messageCta}>
                <MaterialIcons name="forum" size={20} color={colors.onPrimary} />
                <Text style={styles.messageCtaText}>
                  Nhắn tin cho {owner.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{selling.length}</Text>
                <Text style={styles.statLabel}>Sản phẩm</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{soldCount}</Text>
                <Text style={styles.statLabel}>Đã bán</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{rating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Đánh giá</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sản phẩm đang bán</Text>
              <Text style={styles.sectionCount}>{selling.length} tin</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="storefront" size={56} color={colors.surfaceDim} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có sản phẩm nào</Text>
            <Text style={styles.emptyText}>
              {isOwnStore
                ? 'Hãy đăng sản phẩm đầu tiên để bắt đầu bán trên UniLoop.'
                : `Hiện tại chưa có sản phẩm nào đang bán.`}
            </Text>
            {isOwnStore ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/create')}
                style={styles.emptyBtn}>
                <Text style={styles.emptyBtnText}>Đăng sản phẩm</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
        ListFooterComponent={
          isOwnStore ? (
            <View style={styles.logoutWrap}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/change-password' as any)}
                style={styles.accountAction}>
                <MaterialIcons name="lock" size={20} color={colors.primary} />
                <Text style={styles.accountActionText}>Đổi mật khẩu</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/delete-account' as any)}
                style={styles.deleteAction}>
                <MaterialIcons name="delete-forever" size={20} color={colors.error} />
                <Text style={styles.deleteActionText}>Xóa tài khoản</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
              </TouchableOpacity>

              <Button
                title="Đăng xuất"
                variant="outline"
                danger
                icon="logout"
                onPress={() => setLogoutOpen(true)}
                fullWidth
              />
            </View>
          ) : null
        }
      />

      {isOwnStore ? (
        <LogoutModal
          visible={logoutOpen}
          onClose={() => setLogoutOpen(false)}
          onConfirm={async () => {
            setLogoutOpen(false);
            await logout();
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  list: {
    gap: 16,
    padding: 20,
  },
  row: {
    gap: 16,
  },
  loadingWrap: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 80,
  },
  loadingText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  shopHeader: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
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
  messageCta: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    ...shadow.primary,
  },
  messageCtaText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  stats: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
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
    borderRadius: radius.lg,
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
  logoutWrap: {
    gap: 12,
    marginTop: 24,
  },
  accountAction: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...shadow.level1,
  },
  accountActionText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
  },
  deleteAction: {
    alignItems: 'center',
    backgroundColor: 'rgba(186,26,26,0.05)',
    borderColor: 'rgba(186,26,26,0.15)',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  deleteActionText: {
    ...typography.bodyMd,
    color: colors.error,
    flex: 1,
  },
});