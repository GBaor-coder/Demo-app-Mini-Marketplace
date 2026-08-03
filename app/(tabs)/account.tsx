import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStore } from '@/src/context/store-context';
import { colors } from '@/src/theme/colors';

export default function AccountScreen() {
  const {
    currentUser,
    products,
    orders,
    favoriteIds,
    logout,
    resetDemoData,
  } = useStore();

  if (!currentUser) {
    return null;
  }

  const isSeller = currentUser.role === 'seller';
  const relevantOrders = orders.filter((order) =>
    isSeller ? order.sellerId === currentUser.id : order.buyerId === currentUser.id
  );
  const ownProducts = products.filter((product) => product.sellerId === currentUser.id);

  function handleReset() {
    Alert.alert(
      'Khôi phục dữ liệu mẫu?',
      'Sản phẩm đã thêm, giỏ hàng, yêu thích và đơn mới sẽ được đặt lại.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Khôi phục', style: 'destructive', onPress: resetDemoData },
      ]
    );
  }

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Tài khoản</Text>

        <View style={styles.profileBand}>
          <Image contentFit="cover" source={{ uri: currentUser.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{currentUser.name}</Text>
              {currentUser.verified && (
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              )}
            </View>
            <Text style={styles.email}>{currentUser.email}</Text>
            <View style={styles.roleBadge}>
              <Ionicons
                name={isSeller ? 'storefront-outline' : 'bag-handle-outline'}
                size={14}
                color={colors.primaryDark}
              />
              <Text style={styles.roleText}>{isSeller ? 'Người đăng bán' : 'Người mua'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsBand}>
          <ProfileStat label={isSeller ? 'Tin đăng' : 'Yêu thích'} value={isSeller ? ownProducts.length : favoriteIds.length} />
          <ProfileStat label={isSeller ? 'Đơn bán' : 'Đơn mua'} value={relevantOrders.length} />
          <ProfileStat
            label={isSeller ? 'Đã bán' : 'Hoàn tất'}
            value={
              isSeller
                ? ownProducts.filter((product) => product.status === 'sold').length
                : relevantOrders.filter((order) => order.status === 'completed').length
            }
          />
        </View>

        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        <View style={styles.infoSection}>
          <InfoRow icon="call-outline" label="Số điện thoại" value={currentUser.phone} />
          <InfoRow icon="school-outline" label="Trường" value={currentUser.campus} />
          <InfoRow icon="shield-checkmark-outline" label="Xác thực" value="Email đã xác minh" />
        </View>

        <Text style={styles.sectionTitle}>Dữ liệu ứng dụng</Text>
        <View style={styles.menuSection}>
          <TouchableOpacity onPress={handleReset} style={styles.menuRow}>
            <View style={styles.menuIcon}>
              <Ionicons name="refresh-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>Khôi phục dữ liệu mẫu</Text>
              <Text style={styles.menuDescription}>Đưa sản phẩm và đơn hàng về trạng thái ban đầu</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.menuRow}>
            <View style={[styles.menuIcon, styles.logoutIcon]}>
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            </View>
            <View style={styles.menuText}>
              <Text style={[styles.menuTitle, styles.logoutText]}>Đăng xuất</Text>
              <Text style={styles.menuDescription}>Đổi sang tài khoản demo còn lại</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.demoBanner}>
          <Ionicons name="code-slash-outline" size={20} color={colors.primary} />
          <Text style={styles.demoText}>
            UniLoop Demo • Expo SDK 54 • Dữ liệu lưu cục bộ bằng AsyncStorage
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={19} color={colors.primary} />
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 16, paddingBottom: 36 },
  pageTitle: { color: colors.ink, fontSize: 25, fontWeight: '900', marginBottom: 18 },
  profileBand: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: '#CDE6DE',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  avatar: { backgroundColor: colors.surface, borderRadius: 8, height: 76, width: 76 },
  profileInfo: { flex: 1, marginLeft: 13 },
  nameRow: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  name: { color: colors.ink, flexShrink: 1, fontSize: 18, fontWeight: '900' },
  email: { color: colors.inkMuted, fontSize: 12, marginTop: 4 },
  roleBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 6,
    flexDirection: 'row',
    gap: 5,
    marginTop: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  roleText: { color: colors.primaryDark, fontSize: 11, fontWeight: '800' },
  statsBand: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 26,
    marginTop: 12,
    paddingVertical: 14,
  },
  stat: { alignItems: 'center', borderRightColor: colors.border, borderRightWidth: 1, flex: 1 },
  statValue: { color: colors.ink, fontSize: 19, fontWeight: '900' },
  statLabel: { color: colors.inkMuted, fontSize: 11, marginTop: 3 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', marginBottom: 10 },
  infoSection: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
    paddingHorizontal: 13,
  },
  infoRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 11,
    minHeight: 66,
  },
  infoText: { flex: 1 },
  infoLabel: { color: colors.inkMuted, fontSize: 11 },
  infoValue: { color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 3 },
  menuSection: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 11,
    minHeight: 72,
    paddingHorizontal: 12,
  },
  menuIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 7,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  logoutIcon: { backgroundColor: colors.dangerSoft },
  menuText: { flex: 1 },
  menuTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  menuDescription: { color: colors.inkMuted, fontSize: 11, marginTop: 3 },
  logoutText: { color: colors.danger },
  demoBanner: {
    alignItems: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 9,
    marginTop: 18,
    padding: 12,
  },
  demoText: { color: colors.inkMuted, flex: 1, fontSize: 11, lineHeight: 17 },
});
