import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, radius, typography } from '@/src/theme/colors';
import { OrderStatus } from '@/src/types';
import { ORDER_STATUS_LABELS } from '@/src/utils/format';

type Tone = 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'sold';

const TONES: Record<Tone, { bg: string; fg: string }> = {
  primary: { bg: colors.surfaceContainerLow, fg: colors.primary },
  success: { bg: colors.tertiaryFixedDim, fg: colors.tertiary },
  warning: { bg: '#fff2cc', fg: '#8a6200' },
  error: { bg: colors.errorContainer, fg: colors.onErrorContainer },
  neutral: { bg: colors.surfaceContainer, fg: colors.onSurfaceVariant },
  sold: { bg: colors.surfaceContainerHigh, fg: colors.onSurfaceVariant },
};

type StatusBadgeProps = {
  label?: string;
  status?: OrderStatus;
  tone?: Tone;
  small?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
};

export function StatusBadge({ label, status, tone, small, size, style }: StatusBadgeProps) {
  let resolvedTone: Tone = tone ?? 'neutral';
  let resolvedLabel = label;

  if (status) {
    resolvedLabel = ORDER_STATUS_LABELS[status];
    resolvedTone =
      status === 'completed'
        ? 'success'
        : status === 'cancelled' || status === 'rejected'
          ? 'error'
          : status === 'pending'
            ? 'warning'
            : status === 'confirmed'
              ? 'primary'
              : 'neutral';
  }

  const t = TONES[resolvedTone];

  const isLg = size === 'lg';
  const isSm = small || size === 'sm';

  return (
    <View style={[styles.badge, isSm && styles.badgeSmall, isLg && styles.badgeLarge, style]}>
      <View style={[styles.dot, isLg && styles.dotLarge, { backgroundColor: t.fg }]} />
      <Text style={[styles.text, { color: t.fg }, isSm && styles.textSmall, isLg && styles.textLarge]}>
        {resolvedLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeSmall: {
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeLarge: {
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  dot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  dotLarge: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  text: {
    ...typography.labelMd,
    fontSize: 13,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 12,
    lineHeight: 16,
  },
  textLarge: {
    fontSize: 15,
  },
});
