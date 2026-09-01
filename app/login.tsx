import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
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

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, currentUser } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      router.replace('/(tabs)');
    }
  }, [currentUser, router]);

  const validateEmail = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return 'Vui lòng nhập email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Email không hợp lệ.';
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'Vui lòng nhập mật khẩu.';
    return undefined;
  };

  const handleLogin = async () => {
    setError('');

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
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
                <Image source={require('../assets/images/uniloop-icon.png')} style={styles.logoImage} />
              </View>
              <Text style={styles.brand}>UniLoop</Text>
              <Text style={styles.subtitle}>Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email"
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

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/forgot-password')}
                style={styles.forgotWrap}>
                <Text style={styles.forgot}>Quên mật khẩu?</Text>
              </TouchableOpacity>

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
    borderRadius: radius.xl,
    height: 64,
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    width: 64,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 5,
  },
  logoImage: {
    height: 64,
    width: 64,
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
  forgotWrap: {
    alignItems: 'flex-end',
    marginTop: -8,
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
  footer: {
    alignItems: 'center',
    borderTopColor: 'rgba(195,198,215,0.3)',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 16,
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
