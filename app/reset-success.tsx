import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, MaterialIcons } from '@/src/components/ui';
import { colors, radius, shadow, typography } from '@/src/theme/colors';

export default function ResetSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
                <MaterialIcons name="check-circle" size={48} color={colors.onTertiaryContainer} />
              </View>
            </View>

            <Text style={styles.title}>XÁC THỰC - Thành công</Text>
            <Text style={styles.subtitle}>
              Mật khẩu của bạn đã được cập nhật. Bây giờ bạn có thể đăng nhập bằng mật khẩu
              mới của mình.
            </Text>

            <Button
              title="Quay lại đăng nhập"
              variant="primaryContainer"
              onPress={() => {
                router.dismissAll();
                router.push('/login');
              }}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                <Text style={styles.footerBrand}>UniLoop</Text> Ecosystem
              </Text>
            </View>
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
    backgroundColor: 'rgba(0,126,55,0.1)',
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
    backgroundColor: 'rgba(0,126,55,0.2)',
    borderRadius: radius.full,
    height: 96,
    position: 'absolute',
    width: 96,
  },
  iconInner: {
    alignItems: 'center',
    backgroundColor: colors.tertiaryContainer,
    borderRadius: radius.full,
    height: 80,
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
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
  footer: {
    borderTopColor: 'rgba(195,198,215,0.3)',
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 16,
    width: '100%',
  },
  footerText: {
    ...typography.bodySm,
    color: colors.outline,
    textAlign: 'center',
  },
  footerBrand: {
    color: colors.primary,
    fontWeight: '700',
  },
});
