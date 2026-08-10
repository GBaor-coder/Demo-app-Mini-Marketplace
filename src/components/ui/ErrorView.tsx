import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radius, typography } from '@/src/theme/colors';

type ErrorViewProps = {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
};

export function ErrorView({ message = 'Đã có lỗi xảy ra, vui lòng thử lại.', onRetry, compact }: ErrorViewProps) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={styles.iconWrap}>
        <Ionicons name="cloud-offline-outline" size={30} color={colors.error} />
      </View>
      <Text style={styles.title}>Không thể tải dữ liệu</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity activeOpacity={0.8} onPress={onRetry} style={styles.retryButton}>
          <Ionicons name="refresh" size={18} color={colors.primary} />
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  wrapCompact: {
    paddingVertical: 28,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.errorContainer,
    borderRadius: radius['2xl'],
    height: 64,
    justifyContent: 'center',
    marginBottom: 14,
    width: 64,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
    textAlign: 'center',
  },
  message: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginTop: 6,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  retryText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
