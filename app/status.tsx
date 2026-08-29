import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/src/components/Avatar';
import { MaterialIcons, ScreenHeader } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow } from '@/src/theme/colors';

export default function StatusScreen() {
  const { currentUser } = useStore();

  if (!currentUser) return null;

  const items = [
    {
      icon: 'shield' as keyof typeof MaterialIcons.glyphMap,
      label: 'Xác minh tài khoản',
      value: currentUser.verified ? 'Đã xác minh' : 'Chưa xác minh',
      tone: currentUser.verified ? colors.tertiary : colors.outline,
    },
    {
      icon: 'school' as keyof typeof MaterialIcons.glyphMap,
      label: 'Trường học',
      value: currentUser.campus,
      tone: colors.primaryContainer,
    },
    {
      icon: 'star-outline' as keyof typeof MaterialIcons.glyphMap,
      label: 'Đánh giá',
      value: currentUser.rating ? `${currentUser.rating} / 5 (${currentUser.reviewCount ?? 0} đánh giá)` : 'Chưa có',
      tone: colors.star,
    },
    {
      icon: 'calendar-today' as keyof typeof MaterialIcons.glyphMap,
      label: 'Tham gia từ',
      value: currentUser.sellerSince
        ? new Date(currentUser.sellerSince).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : 'Hôm nay',
      tone: colors.onSurfaceVariant,
    },
  ];

  return (
    <View style={styles.screen}>
      <ScreenHeader brand />

      <View style={styles.profileCard}>
        <Avatar uri={currentUser.avatar} name={currentUser.name} size={64} />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{currentUser.name}</Text>
          <Text style={styles.profileEmail}>{currentUser.email}</Text>
        </View>
        <View style={styles.verifiedBadge}>
          <MaterialIcons
            name={currentUser.verified ? 'check-circle' : 'schedule'}
            size={14}
            color={currentUser.verified ? colors.tertiary : colors.outline}
          />
          <Text style={[styles.verifiedText, { color: currentUser.verified ? colors.tertiary : colors.outline }]}>
            {currentUser.verified ? 'Xác minh' : 'Chờ xác minh'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        {items.map((item, index) => (
          <View key={item.label} style={[styles.row, index > 0 && styles.rowDivider]}>
            <MaterialIcons name={item.icon} size={20} color={item.tone} />
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Text style={styles.rowValue} numberOfLines={1}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.note}>
        <MaterialIcons name="info-outline" size={18} color={colors.primary} />
        <Text style={styles.noteText}>
          Tài khoản xác minh sẽ được hiển thị huy hiệu và tăng độ tin cậy khi giao dịch.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    margin: 20,
    padding: 18,
    ...shadow.level1,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    color: colors.onSurface,
    fontSize: 17,
    fontWeight: '700',
  },
  profileEmail: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
  },
  verifiedBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    marginHorizontal: 20,
    paddingHorizontal: 18,
    ...shadow.level1,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 15,
  },
  rowDivider: {
    borderTopColor: colors.outlineVariant,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    color: colors.onSurface,
    flex: 1,
    fontSize: 14,
  },
  rowValue: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    maxWidth: 180,
    textAlign: 'right',
  },
  note: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,74,198,0.06)',
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 8,
    margin: 20,
    padding: 14,
  },
  noteText: {
    color: colors.onSurfaceVariant,
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});
