import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

import { Input } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { UserRole } from '@/src/types';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useStore();
  const { role } = useLocalSearchParams<{ role?: string }>();
  const defaultRole: UserRole = role === 'seller' ? 'seller' : 'buyer';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    setError('');
    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirm) {
      setError('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Email không hợp lệ.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirm) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }
    if (!agree) {
      setError('Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        register(
          { name, email, phone, password, campus: 'Đại học Bách Khoa TP.HCM' },
          defaultRole
        );
        router.replace('/(tabs)');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đăng ký thất bại.');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}>
      <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          <View style={styles.card}>
            <View style={styles.accent} />
            <Text style={styles.brand}>UniLoop</Text>
            <Text style={styles.title}>Tạo tài khoản mới</Text>
            <Text style={styles.subtitle}>Tham gia cộng đồng sinh viên ngay hôm nay.</Text>

            <View style={styles.form}>
              <Input
                label="Họ và tên"
                icon="person-outline"
                value={name}
                onChangeText={setName}
                placeholder="Nguyễn Văn A"
              />
              <Input
                label="Email sinh viên (edu.vn)"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="nguyenvana@student.edu.vn"
                autoCapitalize="none"
                keyboardType="email-address"
                hint="* Vui lòng sử dụng email do trường cấp."
              />
              <Input
                label="Số điện thoại"
                icon="call-outline"
                value={phone}
                onChangeText={setPhone}
                placeholder="0912345678"
                keyboardType="phone-pad"
              />
              <Input
                label="Mật khẩu"
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
              />
              <Input
                label="Xác nhận mật khẩu"
                icon="arrow-back"
                value={confirm}
                onChangeText={setConfirm}
                placeholder="••••••••"
                secureTextEntry
              />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setAgree((v) => !v)}
                style={styles.terms}>
                <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
                  {agree ? (
                    <Ionicons name="checkmark" size={12} color={colors.onPrimary} />
                  ) : null}
                </View>
                <Text style={styles.termsText}>
                  Tôi đồng ý với các <Text style={styles.termsLink}>Điều khoản sử dụng</Text> và{' '}
                  <Text style={styles.termsLink}>Chính sách bảo mật</Text> của UniLoop.
                </Text>
              </TouchableOpacity>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleRegister}
                style={styles.primaryBtn}>
                {loading ? (
                  <ActivityIndicator color={colors.onPrimary} size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Đăng ký tài khoản</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.onPrimary} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản? </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/login')}>
                <Text style={styles.footerLink}>Đăng nhập tại đây</Text>
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
    paddingHorizontal: 20,
  },
  scroll: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
    maxWidth: 480,
    overflow: 'hidden',
    padding: 24,
    position: 'relative',
    width: '100%',
    ...shadow.level1,
  },
  accent: {
    backgroundColor: colors.primary,
    height: 8,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  brand: {
    ...typography.displayLgMobile,
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    gap: 16,
    marginTop: 32,
  },
  terms: {
    alignItems: 'flex-start',
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
    marginTop: 4,
    width: 16,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '400',
  },
  error: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
    marginTop: 32,
    width: '100%',
    ...shadow.level1,
  },
  primaryBtnText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  footerLink: {
    ...typography.bodySm,
    color: colors.primary,
    fontWeight: '600',
  },
});
