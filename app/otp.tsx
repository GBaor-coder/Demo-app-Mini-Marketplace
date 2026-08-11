import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadow, typography } from '@/src/theme/colors';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 120;

export default function OtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email?: string }>();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputsRef = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const next = [...digits];
    if (cleaned.length > 1) {
      cleaned.split('').forEach((char, i) => {
        if (index + i < OTP_LENGTH) next[index + i] = char;
      });
      inputsRef.current[Math.min(index + cleaned.length, OTP_LENGTH - 1)]?.focus();
    } else {
      next[index] = cleaned;
      if (cleaned && index < OTP_LENGTH - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    }
    setDigits(next);
    setError('');
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(''));
    setError('');
    inputsRef.current[0]?.focus();
  };

  const handleSubmit = () => {
    const code = digits.join('');
    if (code.length < OTP_LENGTH) {
      setError('Vui lòng nhập đủ 6 chữ số của mã xác thực.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/reset-password');
    }, 800);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}>
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.card}>
            <View style={styles.decoTop} />
            <View style={styles.decoBottom} />

            <View style={styles.topRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
              </TouchableOpacity>
              <View style={styles.backBtn} />
            </View>

            <View style={styles.header}>
              <View style={styles.iconWrap}>
                <Ionicons name="lock-open" size={32} color={colors.primary} />
              </View>
              <Text style={styles.title}>XÁC THỰC - Nhập mã OTP</Text>
              <Text style={styles.subtitle}>
                Mã xác thực đã được gửi đến email{email ? ` ${email}` : ' của bạn'}.
                Vui lòng kiểm tra hộp thư.
              </Text>
            </View>

            <View style={styles.otpRow}>
              {digits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputsRef.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(value) => handleChange(index, value)}
                  onKeyPress={({ nativeEvent }) => handleKeyDown(index, nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  selectTextOnFocus
                  style={styles.otpInput}
                />
              ))}
            </View>

            <View style={styles.timerRow}>
              <Ionicons name="time-outline" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.timerText}>{timerText}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleResend}
              disabled={secondsLeft > 0}>
              <Text style={[styles.resend, secondsLeft > 0 && styles.resendDisabled]}>
                Gửi lại mã
              </Text>
            </TouchableOpacity>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSubmit}
              style={[styles.submitBtn, digits.join('').length < OTP_LENGTH && styles.submitBtnDisabled]}>
              {loading ? (
                <ActivityIndicator color={colors.onPrimary} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Tiếp tục</Text>
              )}
            </TouchableOpacity>
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
  scroll: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    maxWidth: 400,
    overflow: 'hidden',
    padding: 32,
    position: 'relative',
    width: '100%',
    ...shadow.level2,
  },
  decoTop: {
    backgroundColor: 'rgba(0,74,198,0.05)',
    borderRadius: 80,
    height: 160,
    position: 'absolute',
    right: -80,
    top: -80,
    width: 160,
  },
  decoBottom: {
    backgroundColor: 'rgba(0,88,190,0.05)',
    borderRadius: 80,
    bottom: -80,
    height: 160,
    left: -80,
    position: 'absolute',
    width: 160,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backBtn: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderRadius: radius.full,
    height: 64,
    justifyContent: 'center',
    marginBottom: 8,
    width: 64,
  },
  title: {
    ...typography.displayLgMobile,
    color: colors.onSurface,
    fontSize: 24,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    maxWidth: 280,
    textAlign: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
  },
  otpInput: {
    backgroundColor: colors.background,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    borderWidth: 2,
    color: colors.onSurface,
    fontSize: 24,
    fontWeight: '600',
    height: 56,
    textAlign: 'center',
    width: 48,
  },
  timerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    marginTop: 24,
  },
  timerText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  resend: {
    ...typography.labelMd,
    color: colors.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  resendDisabled: {
    color: colors.outline,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  submitBtn: {
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
    width: '100%',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    ...typography.button,
    color: colors.onPrimary,
  },
});
