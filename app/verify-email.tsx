import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, MaterialIcons } from '@/src/components/ui';
import { colors, radius, shadow, typography } from '@/src/theme/colors';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email?: string }>();

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View style={styles.card}>
          <View style={styles.blobTop} />
          <View style={styles.blobBottom} />

          <View style={styles.content}>
            <View style={styles.iconWrap}>
              <View style={styles.iconPulse} />
              <View style={styles.iconInner}>
                <MaterialIcons name="mark-email-read" size={48} color={colors.primaryContainer} />
              </View>
            </View>

            <Text style={styles.title}>Xác thực email của bạn</Text>
            <Text style={styles.subtitle}>
              Chúng tôi đã gửi một liên kết xác thực đến
              {email ? ` ${email}` : ' email của bạn'}.
            </Text>
            <Text style={styles.hint}>
              Vui lòng kiểm tra hộp thư và nhấn vào liên kết xác thực để kích hoạt tài khoản.
            </Text>

            <View style={styles.steps}>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Mở ứng dụng email trên điện thoại</Text>
              </View>
              <View style={styles.stepDivider} />
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Tìm email từ UniLoop</Text>
              </View>
              <View style={styles.stepDivider} />
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Nhấn vào liên kết xác thực</Text>
              </View>
            </View>

            <Button
              title="Quay lại đăng nhập"
              variant="primaryContainer"
              onPress={() => router.replace('/login')}
            />

            <Text style={styles.footerHint}>
              Sau khi xác thực email, quay lại đây và đăng nhập để tiếp tục.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: 20,
  },
  scroll: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    maxWidth: 480,
    overflow: 'hidden',
    padding: 32,
    position: 'relative',
    width: '100%',
    ...shadow.level2,
  },
  blobTop: {
    backgroundColor: 'rgba(0,74,198,0.1)',
    borderRadius: 128,
    height: 256,
    position: 'absolute',
    right: -100,
    top: -100,
    width: 256,
  },
  blobBottom: {
    backgroundColor: 'rgba(0,88,190,0.05)',
    borderRadius: 128,
    bottom: -100,
    height: 256,
    left: -100,
    position: 'absolute',
    width: 256,
  },
  content: {
    alignItems: 'center',
    gap: 16,
    position: 'relative',
    zIndex: 1,
  },
  iconWrap: {
    alignItems: 'center',
    height: 96,
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
    width: 96,
  },
  iconPulse: {
    backgroundColor: 'rgba(0,74,198,0.15)',
    borderRadius: radius.full,
    height: 96,
    position: 'absolute',
    width: 96,
  },
  iconInner: {
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
    height: 80,
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    width: 80,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  hint: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  steps: {
    backgroundColor: 'rgba(211,228,254,0.3)',
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 12,
    padding: 16,
    width: '100%',
  },
  step: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  stepNumber: {
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  stepNumberText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  stepText: {
    ...typography.bodySm,
    color: colors.onSurface,
    flex: 1,
  },
  stepDivider: {
    backgroundColor: 'rgba(195,198,215,0.4)',
    height: 1,
    marginHorizontal: 14,
  },
  footerHint: {
    ...typography.bodySm,
    color: colors.outline,
    textAlign: 'center',
  },
});
