import { useLocalSearchParams, useRouter } from 'expo-router';
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

const ROLE_OPTIONS: { role: UserRole; label: string; icon: 'shopping-bag' | 'storefront' }[] = [
  { role: 'buyer', label: 'Người mua', icon: 'shopping-bag' },
  { role: 'seller', label: 'Người bán', icon: 'storefront' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useStore();
  const { role } = useLocalSearchParams<{ role?: string }>();
  const [defaultRole, setDefaultRole] = useState<UserRole>(role === 'seller' ? 'seller' : 'buyer');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        router.replace(defaultRole === 'seller' ? '/(tabs)/(seller)' : '/(tabs)/(buyer)');
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
            <Text style={styles.title}>Tạo tài khoản mới</Text>
            <Text style={styles.subtitle}>Tham gia cộng đồng UniLoop ngay hôm nay.</Text>

            <View style={styles.form}>
              <Input
                label="Họ và tên"
                icon="person"
                boxRadius={radius.sm}
                value={name}
                onChangeText={setName}
                placeholder="Nhập họ và tên của bạn"
              />
              <Input
                label="Email sinh viên"
                icon="mail"
                boxRadius={radius.sm}
                value={email}
                onChangeText={setEmail}
                placeholder="example@domain.edu.vn"
                autoCapitalize="none"
                keyboardType="email-address"
                error={email.trim() ? (/\.edu\.vn$/.test(email.trim()) ? undefined : 'Vui lòng sử dụng email có đuôi .edu.vn') : undefined}
              />
              <Input
                label="Số điện thoại"
                icon="phone"
                boxRadius={radius.sm}
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
              />
              <Input
                label="Mật khẩu"
                icon="lock"
                boxRadius={radius.sm}
                value={password}
                onChangeText={setPassword}
                placeholder="Tạo mật khẩu"
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
              <Input
                label="Xác nhận mật khẩu"
                icon="lock-clock"
                boxRadius={radius.sm}
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Nhập lại mật khẩu"
                secureTextEntry
              />

              <View style={styles.roleSection}>
                <Text style={styles.roleLabel}>Mục đích sử dụng chính</Text>
                <View style={styles.roleGrid}>
                  {ROLE_OPTIONS.map((item) => {
                    const active = defaultRole === item.role;
                    return (
                      <TouchableOpacity
                        key={item.role}
                        activeOpacity={0.85}
                        onPress={() => setDefaultRole(item.role)}
                        style={[styles.roleCard, active && styles.roleCardActive]}>
                        <MaterialIcons
                          name={item.icon}
                          size={32}
                          color={active ? colors.primary : colors.onSurfaceVariant}
                        />
                        <Text
                          style={[
                            styles.roleCardText,
                            active && styles.roleCardTextActive,
                          ]}>
                          Tôi muốn là{'\n'}
                          {item.label}
                        </Text>
                        {active ? (
                          <View style={styles.roleCheck}>
                            <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setAgree((v) => !v)}
                style={styles.terms}>
                <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
                  {agree ? (
                    <MaterialIcons name="check" size={12} color={colors.onPrimary} />
                  ) : null}
                </View>
                <Text style={styles.termsText}>
                  Tôi đồng ý với các <Text style={styles.termsLink}>Điều khoản sử dụng</Text> và{' '}
                  <Text style={styles.termsLink}>Chính sách bảo mật</Text> của UniLoop.
                </Text>
              </TouchableOpacity>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button
                title="Đăng ký tài khoản"
                variant="primary"
                loading={loading}
                onPress={handleRegister}
                style={styles.submitBtn}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản? </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/login')}>
                <Text style={styles.footerLink}>Đăng nhập ngay</Text>
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    gap: 16,
    maxWidth: 480,
    padding: 24,
    width: '100%',
    ...shadow.level2,
  },
  title: {
    ...typography.displayLgMobile,
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 4,
    textAlign: 'center',
  },
  form: {
    gap: 16,
    marginTop: 24,
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
  roleSection: {
    gap: 8,
  },
  roleLabel: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  roleCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceBright,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    borderWidth: 2,
    flex: 1,
    gap: 8,
    padding: 16,
    position: 'relative',
  },
  roleCardActive: {
    backgroundColor: 'rgba(0,74,198,0.05)',
    borderColor: colors.primary,
  },
  roleCardText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    textAlign: 'center',
  },
  roleCardTextActive: {
    color: colors.primary,
  },
  roleCheck: {
    position: 'absolute',
    right: 8,
    top: 8,
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
    borderColor: 'rgba(195,198,215,0.3)',
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
    fontWeight: '600',
  },
});
