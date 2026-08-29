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

type Requirement = 'length' | 'upper' | 'number';

const PASSWORD_REQUIREMENTS: { key: Requirement; label: string }[] = [
  { key: 'length', label: 'Ít nhất 8 ký tự' },
  { key: 'upper', label: 'Ít nhất 1 chữ hoa (A-Z)' },
  { key: 'number', label: 'Ít nhất 1 chữ số (0-9)' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const met: Record<Requirement, boolean> = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const allPasswordMet = Object.values(met).every(Boolean);

  const validate = (): string | undefined => {
    if (!name.trim()) return 'Vui lòng nhập họ và tên.';
    if (!email.trim()) return 'Vui lòng nhập email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return 'Email không hợp lệ.';
    if (!phone.trim()) return 'Vui lòng nhập số điện thoại.';
    if (!/^0\d{9}$/.test(phone.trim()))
      return 'Số điện thoại không hợp lệ. Cần 10 chữ số bắt đầu bằng 0.';
    if (!password) return 'Vui lòng nhập mật khẩu.';
    if (!allPasswordMet) return 'Mật khẩu chưa đạt yêu cầu. Vui lòng kiểm tra lại.';
    if (password !== confirm) return 'Xác nhận mật khẩu không khớp.';
    if (!agree) return 'Vui lòng đồng ý với Điều khoản sử dụng.';
    return undefined;
  };

  const handleRegister = async () => {
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        campus: 'Đại học Bách Khoa TP.HCM',
      });

      if (result.needsVerification) {
        router.replace({ pathname: '/verify-email' as any, params: { email: email.trim() } });
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
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
                label="Email"
                icon="mail"
                boxRadius={radius.sm}
                value={email}
                onChangeText={setEmail}
                placeholder="example@domain.com"
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Input
                label="Số điện thoại"
                icon="phone"
                boxRadius={radius.sm}
                value={phone}
                onChangeText={setPhone}
                placeholder="0xxxxxxxxx"
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
            </View>

            {password.length > 0 && (
              <View style={styles.criteria}>
                <Text style={styles.criteriaTitle}>Mật khẩu của bạn phải có:</Text>
                {PASSWORD_REQUIREMENTS.map((req) => {
                  const isMet = met[req.key];
                  return (
                    <View key={req.key} style={styles.criteriaRow}>
                      <MaterialIcons
                        name={isMet ? 'check-circle' : 'radio-button-unchecked'}
                        size={18}
                        color={isMet ? colors.primary : colors.outline}
                      />
                      <Text style={[styles.criteriaText, isMet && styles.criteriaTextMet]}>
                        {req.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

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
                Tôi đồng ý với <Text style={styles.termsLink}>Điều khoản sử dụng</Text> và{' '}
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
    gap: 14,
    marginTop: 8,
  },
  criteria: {
    backgroundColor: 'rgba(211,228,254,0.3)',
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  criteriaTitle: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginBottom: 2,
  },
  criteriaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  criteriaText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  criteriaTextMet: {
    color: colors.onSurface,
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
  submitBtn: {
    marginTop: 4,
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
    fontWeight: '600',
  },
});
