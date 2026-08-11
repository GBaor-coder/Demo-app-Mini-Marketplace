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
import { colors, radius, shadow, typography } from '@/src/theme/colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    if (!email.trim()) {
      setError('Vui lòng nhập email sinh viên của bạn.');
      return;
    }
    router.push({ pathname: '/otp', params: { email: email.trim() } });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}>
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>XÁC THỰC - Quên mật khẩu</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.card}>
            <View style={styles.decoTop} />
            <View style={styles.decoBottom} />

            <View style={styles.content}>
              <View style={styles.iconWrap}>
                <MaterialIcons name="lock-reset" size={32} color={colors.primaryContainer} />
              </View>
              <Text style={styles.title}>Quên mật khẩu?</Text>
              <Text style={styles.subtitle}>
                Nhập email sinh viên của bạn để nhận mã OTP xác thực.
              </Text>

              <View style={styles.form}>
                <Input
                  label="Email sinh viên"
                  icon="mail"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="mssv@student.edu.vn"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
              </View>

              <Button
                title="Gửi mã OTP"
                icon="send"
                variant="primaryContainer"
                onPress={handleSubmit}
              />

              <Button
                title="Quay lại Đăng nhập"
                variant="tonal"
                onPress={() => router.replace('/login')}
              />
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
  decoBottom: {
    backgroundColor: 'rgba(0,88,190,0.05)',
    borderRadius: 48,
    bottom: -32,
    height: 96,
    left: -32,
    position: 'absolute',
    width: 96,
  },
  content: {
    gap: 24,
    position: 'relative',
    zIndex: 1,
  },
  iconWrap: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderRadius: radius.full,
    height: 64,
    justifyContent: 'center',
    marginBottom: 4,
    width: 64,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: -12,
    textAlign: 'center',
  },
  form: {
    gap: 8,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
  },
});
