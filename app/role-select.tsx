import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, MaterialIcons } from '@/src/components/ui';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { UserRole } from '@/src/types';

const ROLE_CARDS: {
  role: UserRole;
  title: string;
  description: string;
  icon: 'shopping-bag' | 'storefront';
}[] = [
  {
    role: 'buyer',
    title: 'Người mua',
    description: 'Tìm kiếm giáo trình, đồ dùng học tập dễ dàng từ sinh viên khác.',
    icon: 'shopping-bag',
  },
  {
    role: 'seller',
    title: 'Người đăng bán',
    description: 'Kiếm thêm thu nhập từ đồ cũ, giáo trình không còn sử dụng.',
    icon: 'storefront',
  },
];

export default function RoleSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<UserRole | null>(null);

  const handleStart = () => {
    if (selected) {
      router.push(`/register?role=${selected}`);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <MaterialIcons name="autorenew" size={32} color={colors.onPrimaryContainer} />
            </View>
            <Text style={styles.title}>Chào mừng bạn đến với UniLoop!</Text>
            <Text style={styles.subtitle}>Bạn muốn bắt đầu với vai trò nào?</Text>
          </View>

          <View style={styles.roleList}>
            {ROLE_CARDS.map((item) => {
              const active = selected === item.role;
              return (
                <TouchableOpacity
                  key={item.role}
                  activeOpacity={0.85}
                  onPress={() => setSelected(item.role)}
                  style={[styles.roleCard, active && styles.roleCardActive]}>
                  <View style={styles.roleHeader}>
                    <View style={[styles.roleIcon, active && styles.roleIconActive]}>
                      <MaterialIcons
                        name={item.icon}
                        size={24}
                        color={active ? colors.onPrimary : colors.primary}
                      />
                    </View>
                    {active ? (
                      <View style={styles.check}>
                        <MaterialIcons name="check" size={16} color={colors.onPrimary} />
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.roleTitle}>{item.title}</Text>
                  <Text style={styles.roleDescription}>{item.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.infoPill}>
            <MaterialIcons name="info" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.infoText}>
              Bạn có thể thay đổi vai trò bất cứ lúc nào trong trang cá nhân
            </Text>
          </View>

          <Button
            title="Bắt đầu ngay"
            variant="primaryContainer"
            icon="arrow-forward"
            disabled={!selected}
            onPress={handleStart}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
    overflow: 'hidden',
    paddingHorizontal: 20,
  },
  blobTop: {
    backgroundColor: 'rgba(0,74,198,0.05)',
    borderRadius: 200,
    height: 400,
    left: -160,
    position: 'absolute',
    top: -160,
    width: 400,
  },
  blobBottom: {
    backgroundColor: 'rgba(33,112,228,0.1)',
    borderRadius: 200,
    bottom: -180,
    height: 400,
    position: 'absolute',
    right: -180,
    width: 400,
  },
  scroll: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
    gap: 24,
    maxWidth: 672,
    padding: 32,
    width: '100%',
    ...shadow.level2,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
    height: 64,
    justifyContent: 'center',
    marginBottom: 16,
    width: 64,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  roleList: {
    gap: 16,
    marginTop: 8,
  },
  roleCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.lg,
    borderWidth: 2,
    gap: 8,
    padding: 16,
  },
  roleCardActive: {
    borderColor: colors.primaryContainer,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 4,
  },
  roleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  roleIconActive: {
    backgroundColor: colors.primaryContainer,
  },
  check: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  roleTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    marginBottom: 4,
  },
  roleDescription: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  infoPill: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  infoText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flexShrink: 1,
  },
});
