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

export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const met: Record<Requirement, boolean> = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
  };

  const allMet = Object.values(met).every(Boolean);

  const handleSubmit = async () => {
    setError('');

    if (!currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (!allMet) {
      setError('Mật khẩu mới chưa đạt yêu cầu.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu mới không khớp.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('Mật khẩu mới phải khác mật khẩu hiện tại.');
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

      setSuccess(true);
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.card}>
            <View style={styles.successIcon}>
              <MaterialIcons name="check-circle" size={56} color={colors.tertiaryContainer} />
            </View>
            <Text style={styles.successTitle}>Đổi mật khẩu thành công</Text>
            <Text style={styles.successSubtitle}>
              Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại với mật khẩu mới.
            </Text>
            <Button
              title="Quay lại đăng nhập"
              variant="primaryContainer"
              onPress={() => {
                supabase.auth.signOut();
                router.replace('/login');
              }}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}>
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.card}>
            <View style={styles.decoTop} />

            <View style={styles.form}>
              <Input
                label="Mật khẩu hiện tại"
                icon="lock"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Nhập mật khẩu hiện tại"
                secureTextEntry={!showCurrent}
                right={
                  <TouchableOpacity
                    onPress={() => setShowCurrent((v) => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialIcons
                      name={showCurrent ? 'visibility' : 'visibility-off'}
                      size={20}
                      color={colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                }
              />
              <Input
                label="Mật khẩu mới"
                icon="lock-reset"
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
                label="Xác nhận mật khẩu mới"
                icon="lock-clock"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
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

            {newPassword.length > 0 && (
              <View style={styles.criteria}>
                <Text style={styles.criteriaTitle}>Mật khẩu mới phải có:</Text>
                {REQUIREMENTS.map((req) => {
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
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.9)',
    flexDirection: 'row',
    height: 64,
    paddingHorizontal: 8,
    ...shadow.level1,
  },
  headerBtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    ...typography.headlineMd,
    color: colors.primary,
    flex: 1,
    fontSize: 18,
    textAlign: 'center',
  },
  scroll: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    maxWidth: 480,
    overflow: 'hidden',
    padding: 28,
    position: 'relative',
    width: '100%',
    ...shadow.level1,
  },
  decoTop: {
    backgroundColor: 'rgba(0,74,198,0.05)',
    borderRadius: 64,
    height: 128,
    position: 'absolute',
    right: -48,
    top: -48,
    width: 128,
  },
  form: {
    gap: 14,
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
  error: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 8,
  },
  successTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  successSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
