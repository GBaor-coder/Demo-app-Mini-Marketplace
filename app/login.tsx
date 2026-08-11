import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Input, MaterialIcons } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { UserRole } from '@/src/types';

type AuthRole = 'buyer' | 'seller';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, loginGuest } = useStore();

  const [role, setRole] = useState<AuthRole>('buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<AuthRole | null>(null);

  const handleLogin = () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const ok = login(email, password, role);
      setLoading(false);
      if (!ok) {
        setError('Email hoặc mật khẩu không đúng.');
        return;
      }
      router.replace(role === 'seller' ? '/(tabs)/(seller)' : '/(tabs)/(buyer)');
    }, 500);
  };

  const handleGuest = (guestRole: AuthRole) => {
    setError('');
    setDemoLoading(guestRole);
    setTimeout(() => {
      loginGuest(guestRole as UserRole);
      setDemoLoading(null);
      router.replace(guestRole === 'seller' ? '/(tabs)/(seller)' : '/(tabs)/(buyer)');
    }, 400);
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
                <MaterialIcons name="sync" size={32} color={colors.onPrimaryContainer} />
              </View>
              <Text style={styles.brand}>UniLoop</Text>
              <Text style={styles.subtitle}>Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</Text>
            </View>

            <View style={styles.segment}>
              {(['buyer', 'seller'] as const).map((item) => {
                const active = role === item;
                return (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.8}
                    onPress={() => {
                      setRole(item);
                      setError('');
                    }}
                    style={[styles.segmentItem, active && styles.segmentItemActive]}>
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                      {item === 'buyer' ? 'Người mua' : 'Người bán'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.form}>
              <Input
                label="Email trường học"
                icon="mail"
                value={email}
                onChangeText={setEmail}
                placeholder="student@university.edu.vn"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              <Input
                label="Mật khẩu"
                icon="lock"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                right={
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialIcons
                      name={showPassword ? 'visibility' : 'visibility-off'}
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
                      <MaterialIcons name="check" size={12} color={colors.onPrimary} />
                    ) : null}
                  </View>
                  <Text style={styles.rememberText}>Nhớ tài khoản</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push('/forgot-password')}>
                  <Text style={styles.forgot}>Quên mật khẩu?</Text>
                </TouchableOpacity>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button
                title="Đăng nhập"
                icon="arrow-forward"
                variant="primaryContainer"
                loading={loading}
                onPress={handleLogin}
                style={styles.submitBtn}
              />
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.demoGroup}>
              <Button
                title="Dùng thử vai trò Người mua"
                icon="shopping-bag"
                variant="outline"
                loading={demoLoading === 'buyer'}
                onPress={() => handleGuest('buyer')}
              />
              <Button
                title="Dùng thử vai trò Người bán"
                icon="sell"
                variant="outline"
                loading={demoLoading === 'seller'}
                onPress={() => handleGuest('seller')}
              />
            </View>

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
    borderRadius: radius['2xl'],
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
    borderRadius: radius.xl,
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
  segment: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.lg,
    flexDirection: 'row',
    padding: 4,
  },
  segmentItem: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  segmentItemActive: {
    backgroundColor: colors.surfaceContainerLowest,
    ...shadow.level1,
  },
  segmentText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  segmentTextActive: {
    color: colors.primary,
    fontWeight: '600',
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
  submitBtn: {
    marginTop: 8,
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    marginVertical: 4,
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
  demoGroup: {
    gap: 8,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
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
