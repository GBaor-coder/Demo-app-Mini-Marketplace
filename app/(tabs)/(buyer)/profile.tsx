import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/Avatar';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
  badge?: number;
};

export default function BuyerProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, logout, unreadCount } = useStore();
  const [showLogout, setShowLogout] = useState(false);

  if (!currentUser) {
    return null;
  }

  const group1: MenuItem[] = [
    {
      icon: 'heart-outline',
      label: 'Sản phẩm yêu thích',
      route: '/favorites',
    },
    { icon: 'location-outline', label: 'Địa chỉ đã lưu', route: '/addresses' },
    {
      icon: 'bag-handle-outline',
      label: 'Lịch sử mua hàng',
      route: '/(tabs)/(buyer)/orders',
    },
  ];

  const group2: MenuItem[] = [
    {
      icon: 'notifications-outline',
      label: 'Thông báo',
      route: '/(tabs)/(buyer)/notifications',
      badge: unreadCount,
    },
    { icon: 'settings-outline', label: 'Cài đặt', route: '/status' },
    { icon: 'flag-outline', label: 'Trợ giúp & Báo cáo', route: '/report' },
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
            <Ionicons name={item.icon} size={22} color={colors.primary} />
          </View>
          <Text style={styles.menuLabel}>{item.label}</Text>
          {item.badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          ) : null}
          <Ionicons name="chevron-forward" size={20} color={colors.outlineVariant} />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.scroll}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.brand}>UniLoop</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Avatar uri={currentUser.avatar} name={currentUser.name} size={96} />
            <View style={styles.verified}>
              <Ionicons name="shield-checkmark" size={16} color={colors.onSecondaryContainer} />
            </View>
          </View>
          <Text style={styles.name}>{currentUser.name}</Text>
          <View style={styles.schoolRow}>
            <Ionicons name="school-outline" size={16} color={colors.onSurfaceVariant} />
            <Text style={styles.school}>{currentUser.campus}</Text>
          </View>
          <View style={styles.ratingChip}>
            <Ionicons name="star" size={18} color={colors.tertiaryContainer} />
            <Text style={styles.ratingValue}>{currentUser.rating?.toFixed(1) ?? '5.0'}/5</Text>
            <Text style={styles.ratingSep}>•</Text>
            <Text style={styles.ratingCount}>{currentUser.reviewCount ?? 0} Đánh giá</Text>
          </View>
        </View>

        {renderGroup(group1)}
        {renderGroup(group2)}

        <TouchableOpacity activeOpacity={0.8} onPress={() => setShowLogout(true)} style={styles.logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={showLogout}
        onRequestClose={() => setShowLogout(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Đăng xuất?</Text>
            <Text style={styles.modalBody}>Bạn có chắc chắn muốn đăng xuất khỏi UniLoop?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowLogout(false)} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowLogout(false);
                  logout();
                  router.replace('/login');
                }}
                style={styles.modalConfirm}>
                <Text style={styles.modalConfirmText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    paddingBottom: 12,
  },
  brand: {
    ...typography.headlineSm,
    color: colors.primary,
    fontSize: 20,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
    marginBottom: 24,
    padding: 24,
    ...shadow.level1,
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
  menuCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
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
    borderRadius: radius.xl,
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
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(11,28,48,0.42)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 28,
    gap: 8,
    maxWidth: 340,
    padding: 24,
    width: '100%',
    ...shadow.level3,
  },
  modalTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    marginBottom: 4,
  },
  modalBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  modalCancel: {
    alignItems: 'center',
    borderRadius: radius.full,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalCancelText: {
    ...typography.button,
    color: colors.primary,
  },
  modalConfirm: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: radius.full,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalConfirmText: {
    ...typography.button,
    color: colors.onError,
  },
});
