import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/src/theme/colors';

type SectionHeaderProps = {
  title: string;
  action?: ReactNode;
  subtitle?: string;
};

export function SectionHeader({ title, action, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

type RatingStarsProps = {
  rating: number;
  size?: number;
  count?: number;
  showValue?: boolean;
};

export function RatingStars({ rating, size = 15, count, showValue }: RatingStarsProps) {
  return (
    <View style={styles.ratingRow}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = rating >= i - 0.25;
        const half = !filled && rating >= i - 0.75;
        return (
          <Ionicons
            key={i}
            name={half ? 'star-half' : filled ? 'star' : 'star-outline'}
            size={size}
            color={colors.star}
          />
        );
      })}
      {showValue ? <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text> : null}
      {typeof count === 'number' ? (
        <Text style={styles.ratingCount}>({count})</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  left: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  ratingValue: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  ratingCount: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    marginLeft: 2,
  },
});
