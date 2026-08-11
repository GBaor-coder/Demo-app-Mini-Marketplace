import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { IconName, MaterialIcons } from './Icon';
import { colors, radius, typography } from '@/src/theme/colors';

type ErrorViewProps = {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
  icon?: IconName;
  title?: string;
};

export function ErrorView({
  message = 'Vui lòng kiểm tra lại kết nối hoặc thử lại sau vài phút.',
  onRetry,
  compact,
  icon = 'warning',
  title = 'Đã có lỗi xảy ra',
}: ErrorViewProps) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={styles.iconWrap}>
        <MaterialIcons name={icon} size={48} color={colors.error} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Button
          title="Thử lại"
          variant="primary"
          icon="refresh"
          size="sm"
          onPress={onRetry}
          style={styles.retryButton}
        />
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
    backgroundColor: 'rgba(186,26,26,0.10)',
    borderRadius: radius.full,
    height: 96,
    justifyContent: 'center',
    marginBottom: 20,
    width: 96,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  message: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 280,
  },
  retryButton: {
    marginTop: 24,
    minWidth: 140,
  },
});
