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
import { supabase } from '@/src/lib/supabase';
import { colors, radius, shadow, typography } from '@/src/theme/colors';

type Requirement = 'length' | 'upper' | 'number';

const REQUIREMENTS: { key: Requirement; label: string }[] = [
  { key: 'length', label: 'Ít nhất 8 ký tự' },
  { key: 'upper', label: 'Ít nhất 1 chữ hoa' },
  { key: 'number', label: 'Ít nhất 1 chữ số' },
];

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const met: Record<Requirement, boolean> = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
  };

  const handleSubmit = async () => {
    setError('');
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Mật khẩu chưa đạt yêu cầu. Vui lòng kiểm tra lại.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) {
        setError('Không thể cập nhật mật khẩu. Vui lòng thử lại sau.');
        return;
      }
      await supabase.auth.signOut().catch(() => {});
      router.replace('/reset-success');
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}>
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.blobTop} />
        <View style={styles.blobBottom} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.card}>
            <View style={styles.topRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <MaterialIcons name="arrow-back" size={24} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
              <Text style={styles.brand}>UniLoop</Text>
              <View style={styles.backBtn} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Đặt lại mật khẩu</Text>
              <Text style={styles.subtitle}>
                Vui lòng tạo mật khẩu mới an toàn hơn cho tài khoản của bạn.
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Mật khẩu mới"
                icon="lock"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nhập mật khẩu mới"
                secureTextEntry={!showNew}
                right={
                  <TouchableOpacity
                    onPress={() => setShowNew((v) => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialIcons
                      name={showNew ? 'visibility' : 'visibility-off'}
                      size={20}
                      color={colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                }
              />
              <Input
                label="Xác nhận mật khẩu"
                icon="lock-reset"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu"
                secureTextEntry={!showConfirm}
                right={
                  <TouchableOpacity
                    onPress={() => setShowConfirm((v) => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialIcons
                      name={showConfirm ? 'visibility' : 'visibility-off'}
                      size={20}
                      color={colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                }
              />
            </View>

            <View style={styles.criteria}>
              <Text style={styles.criteriaTitle}>Mật khẩu của bạn phải có:</Text>
              {REQUIREMENTS.map((req) => {
                const isMet = met[req.key];
                return (
                  <View key={req.key} style={styles.criteriaRow}>
                    <MaterialIcons
                      name={isMet ? 'check-circle' : 'radio-button-unchecked'}
                      size={18}
                      color={isMet ? colors.primary : colors.outline}
                    />
                    <Text
                      style={[styles.criteriaText, isMet && styles.criteriaTextMet]}>
                      {req.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              title="Cập nhật mật khẩu"
              variant="primaryContainer"
              loading={loading}
              onPress={handleSubmit}
            />
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
    backgroundColor: colors.background,
    flex: 1,
    overflow: 'hidden',
  },
  blobTop: {
    backgroundColor: 'rgba(0,74,198,0.05)',
    borderRadius: 200,
    height: 400,
    left: -160,
    position: 'absolute',
    top: -200,
    width: 400,
  },
  blobBottom: {
    backgroundColor: 'rgba(0,126,55,0.05)',
    borderRadius: 200,
    bottom: -200,
    height: 400,
    position: 'absolute',
    right: -160,
    width: 400,
  },
  scroll: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    gap: 24,
    maxWidth: 480,
    padding: 28,
    width: '100%',
    ...shadow.level2,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backBtn: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  brand: {
    ...typography.headlineMd,
    color: colors.primary,
    fontSize: 18,
  },
  header: {
    gap: 8,
  },
  title: {
    ...typography.displayLgMobile,
    color: colors.onSurface,
    fontSize: 26,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  form: {
    gap: 16,
  },
  criteria: {
    backgroundColor: 'rgba(211,228,254,0.3)',
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  criteriaTitle: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
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
  error: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
  },
});
