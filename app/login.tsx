import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStore } from '@/src/context/store-context';
import { Input } from '@/src/components/ui';
import { colors, radius, shadow, typography } from '@/src/theme/colors';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, loginGuest } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const ok = login(email, password);
      setLoading(false);
      if (!ok) {
        setError('Email hoặc mật khẩu không đúng.');
        return;
      }
      router.replace('/(tabs)');
    }, 500);
  };

  const handleGuest = () => {
    loginGuest();
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}>
      <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.blobTop} />
        <View style={styles.blobBottom} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.logo}>
                <Ionicons name="sync" size={32} color={colors.onPrimaryContainer} />
              </View>
              <Text style={styles.brand}>UniLoop</Text>
              <Text style={styles.subtitle}>Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email trường học"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="student@university.edu.vn"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              <Input
                label="Mật khẩu"
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                right={
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                }
              />

              <View style={styles.row}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setRemember((v) => !v)}
                  style={styles.remember}>
                  <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
                    {remember ? (
                      <Ionicons name="checkmark" size={12} color={colors.onPrimary} />
                    ) : null}
                  </View>
                  <Text style={styles.rememberText}>Nhớ tài khoản</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} onPress={() => {}}>
                  <Text style={styles.forgot}>Quên mật khẩu?</Text>
                </TouchableOpacity>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleLogin}
                style={styles.primaryBtn}>
                {loading ? (
                  <ActivityIndicator color={colors.onPrimary} size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Đăng nhập</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.onPrimary} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleGuest}
              style={styles.guestBtn}>
              <Ionicons name="compass-outline" size={20} color={colors.primary} />
              <Text style={styles.guestBtnText}>Trải nghiệm Demo (Guest)</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/register')}>
                <Text style={styles.footerLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
    left: -180,
    position: 'absolute',
    top: -200,
    width: 400,
  },
  blobBottom: {
    backgroundColor: 'rgba(0,88,190,0.05)',
    borderRadius: 220,
    bottom: -220,
    height: 440,
    position: 'absolute',
    right: -220,
    width: 440,
  },
  scroll: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius['3xl'],
    borderWidth: 1,
    gap: 24,
    maxWidth: 440,
    padding: 32,
    width: '100%',
    ...shadow.level2,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: radius['2xl'],
    height: 64,
    justifyContent: 'center',
    marginBottom: 8,
    width: 64,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 5,
  },
  brand: {
    ...typography.displayLgMobile,
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  remember: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.outlineVariant,
    borderRadius: 4,
    borderWidth: 1,
    height: 16,
    justifyContent: 'center',
    width: 16,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rememberText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  forgot: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '500',
  },
  error: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryBtn: {
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.xl,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
    width: '100%',
  },
  primaryBtnText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    marginVertical: 8,
  },
  dividerLine: {
    backgroundColor: 'rgba(195,198,215,0.5)',
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...typography.labelMd,
    color: colors.outline,
  },
  guestBtn: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
    width: '100%',
  },
  guestBtnText: {
    ...typography.button,
    color: colors.onSurface,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  footerLink: {
    ...typography.bodySm,
    color: colors.primary,
    fontWeight: '500',
  },
});
