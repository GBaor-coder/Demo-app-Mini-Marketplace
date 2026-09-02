import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Avatar } from '@/src/components/Avatar';
import { Button, EmptyState, IconButton, LogoutModal, MaterialIcons, ScreenHeader } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';

type MenuItem = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  route?: string;
  badge?: number;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, logout, products, orders } = useStore();
  const [showLogout, setShowLogout] = useState(false);

  if (!currentUser) {
    return (
      <View style={styles.screen}>
        <EmptyState
          icon="person"
          title="Vui lòng đăng nhập"
          description="Bạn cần đăng nhập để xem hồ sơ.">
          <Button title="Đăng nhập" onPress={() => router.push('/login')} />
        </EmptyState>
      </View>
    );
  }

  const myProducts = products.filter((p) => p.sellerId === currentUser.id);
  const activeProductsCount = myProducts.filter(
    (p) => p.status === 'active' && p.stock > 0
  ).length;
  const totalProductsCount = myProducts.filter((p) => p.status !== 'draft').length;
  const myOrdersCount = orders.filter((o) => o.buyerId === currentUser.id).length;
  const sellerOrdersCount = orders.filter((o) => o.sellerId === currentUser.id).length;

  const group1: MenuItem[] = [
    {
      icon: 'chat',
      label: 'Tin nhắn',
      route: '/chats',
    },
    {
      icon: 'favorite',
      label: 'Sản phẩm yêu thích',
      route: '/favorites',
    },
    {
      icon: 'shopping-bag',
      label: 'Lịch sử mua hàng',
      route: '/(tabs)/orders',
    },
  ];

  const group2: MenuItem[] = [
    { icon: 'lock', label: 'Đổi mật khẩu', route: '/change-password' },
  ];

  const sellerGroup: MenuItem[] = [
    {
      icon: 'inventory-2',
      label: 'Quản lý sản phẩm',
      route: '/products',
    },
  ];

  const renderGroup = (items: MenuItem[]) => (
    <View style={styles.menuCard}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.label}
          activeOpacity={0.7}
          onPress={() => item.route && router.push(item.route as any)}
          style={[styles.menuRow, index > 0 && styles.menuRowBorder]}>
          <View style={styles.menuIcon}>
            <MaterialIcons name={item.icon} size={22} color={colors.primary} />
          </View>
          <Text style={styles.menuLabel}>{item.label}</Text>
          {item.badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          ) : null}
          <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader brand showBack={false} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <IconButton
            name="edit"
            onPress={() => router.push('/edit-profile' as any)}
            style={styles.editBtn}
            accessibilityLabel="Chỉnh sửa hồ sơ"
          />
          <View style={styles.avatarWrap}>
            <Avatar uri={currentUser.avatar} name={currentUser.name} size={96} />
            <View style={styles.verified}>
              <MaterialIcons name="verified" size={16} color={colors.onSecondaryContainer} />
            </View>
          </View>
          <Text style={styles.name}>{currentUser.name}</Text>
          <View style={styles.schoolRow}>
            <MaterialIcons name="school" size={16} color={colors.onSurfaceVariant} />
            <Text style={styles.school}>{currentUser.campus}</Text>
          </View>
          {currentUser.bio ? <Text style={styles.bio}>{currentUser.bio}</Text> : null}
          <View style={styles.ratingChip}>
            <MaterialIcons name="star" size={18} color={colors.star} />
            <Text style={styles.ratingValue}>{currentUser.rating?.toFixed(1) ?? '5.0'}/5</Text>
            <Text style={styles.ratingSep}>•</Text>
            <Text style={styles.ratingCount}>{currentUser.reviewCount ?? 0} Đánh giá</Text>
          </View>
        </View>

        {myProducts.length > 0 && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalProductsCount}</Text>
              <Text style={styles.statLabel}>Sản phẩm</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sellerOrdersCount}</Text>
              <Text style={styles.statLabel}>Đơn bán</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{myOrdersCount}</Text>
              <Text style={styles.statLabel}>Đơn mua</Text>
            </View>
          </View>
        )}

        {myProducts.length > 0 && renderGroup(sellerGroup)}
        {renderGroup(group1)}
        {renderGroup(group2)}

        <TouchableOpacity activeOpacity={1} onPress={() => setShowLogout(true)} style={styles.logout}>
          <MaterialIcons name="logout" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/delete-account' as any)}
          style={styles.deleteAccount}>
          <MaterialIcons name="delete-forever" size={20} color={colors.error} />
          <Text style={styles.deleteAccountText}>Xóa tài khoản</Text>
        </TouchableOpacity>
      </ScrollView>

      <LogoutModal
        visible={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={async () => {
          setShowLogout(false);
          await logout();
          router.replace('/login');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  scroll: {
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    marginBottom: 24,
    marginTop: 16,
    padding: 24,
    position: 'relative',
    ...shadow.level1,
  },
  editBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderRadius: radius.full,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    top: 12,
    width: 36,
  },
  bio: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },
  avatarWrap: {
    position: 'relative',
  },
  verified: {
    alignItems: 'center',
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.surfaceContainerLowest,
    borderRadius: radius.full,
    borderWidth: 2,
    bottom: 0,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 28,
  },
  name: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginTop: 16,
  },
  schoolRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginTop: 4,
  },
  school: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
  },
  ratingChip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingSep: {
    color: colors.outline,
  },
  ratingCount: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
  },
  statsCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    flexDirection: 'row',
    marginBottom: 24,
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
  statsHint: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginBottom: 24,
    marginTop: -16,
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  menuCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    marginBottom: 24,
    overflow: 'hidden',
    ...shadow.level1,
  },
  menuRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuRowBorder: {
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopWidth: 1,
  },
  menuIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  menuLabel: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: radius.full,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.onError,
    fontSize: 11,
    fontWeight: '700',
  },
  logout: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  logoutText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '500',
  },
  deleteAccount: {
    alignItems: 'center',
    backgroundColor: 'rgba(186,26,26,0.05)',
    borderColor: 'rgba(186,26,26,0.15)',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 16,
    paddingVertical: 14,
  },
  deleteAccountText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '500',
  },
});
