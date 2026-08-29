import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaterialIcons } from '@/src/components/ui';
import { colors, radius, shadow, typography } from '@/src/theme/colors';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View style={styles.hero}>
          <Image
            contentFit="cover"
            source={{
              uri: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900',
            }}
            style={styles.heroImage}
            transition={200}
          />
          <View style={[styles.badge, styles.badgeTop]}>
            <MaterialIcons name="sell" size={14} color={colors.primary} />
            <Text style={styles.badgeText}>Đồ cũ giá tốt</Text>
          </View>
          <View style={[styles.badge, styles.badgeBottom]}>
            <MaterialIcons name="verified" size={14} color={colors.tertiary} />
            <Text style={styles.badgeText}>An toàn</Text>
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.logo}>
            <MaterialIcons name="autorenew" size={32} color={colors.onPrimaryContainer} />
          </View>
          <Text style={styles.brand}>UniLoop</Text>
          <Text style={styles.tagline}>Chợ sinh viên nội bộ</Text>
          <Text style={styles.subtext}>
            Mua bán an toàn, nhanh chóng ngay trong khuôn viên trường đại học của bạn.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/register')}
              style={styles.primaryCta}>
              <Text style={styles.primaryCtaText}>Bắt đầu ngay</Text>
              <MaterialIcons name="arrow-forward" size={20} color={colors.onPrimaryContainer} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/login')}
              style={styles.secondaryCta}>
              <Text style={styles.secondaryCtaText}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
    paddingHorizontal: 20,
  },
  scroll: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  hero: {
    aspectRatio: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius['2xl'],
    marginBottom: 32,
    maxWidth: 448,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    ...shadow.level2,
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  badge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
    ...shadow.level1,
  },
  badgeTop: {
    left: 16,
    top: 16,
  },
  badgeBottom: {
    bottom: 16,
    right: 16,
  },
  badgeText: {
    color: colors.onSurface,
    fontSize: 12,
    fontWeight: '600',
  },
  panel: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 32,
    borderWidth: 1,
    maxWidth: 448,
    padding: 32,
    width: '100%',
    ...shadow.level3,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.lg,
    height: 64,
    justifyContent: 'center',
    marginBottom: 24,
    width: 64,
    ...shadow.level1,
  },
  brand: {
    ...typography.displayLgMobile,
    color: colors.onSurface,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    ...typography.headlineSm,
    color: colors.primary,
    marginBottom: 16,
  },
  subtext: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    marginBottom: 32,
    maxWidth: 280,
    textAlign: 'center',
  },
  actions: {
    gap: 16,
    width: '100%',
  },
  primaryCta: {
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 8,
    height: 56,
    justifyContent: 'center',
    ...shadow.primary,
    width: '100%',
  },
  primaryCtaText: {
    ...typography.button,
    color: colors.onPrimaryContainer,
  },
  secondaryCta: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderColor: 'rgba(195,198,215,0.5)',
    borderRadius: radius.md,
    borderWidth: 2,
    height: 56,
    justifyContent: 'center',
    width: '100%',
  },
  secondaryCtaText: {
    ...typography.button,
    color: colors.onSurface,
  },
});
