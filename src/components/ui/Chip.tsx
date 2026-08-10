import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radius, typography } from '@/src/theme/colors';

type ChipProps = {
  label: string;
  icon?: string;
  selected?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md';
  leading?: React.ReactNode;
};

export function Chip({ label, icon, selected, onPress, size = 'md', leading }: ChipProps) {
  const Tag = onPress ? TouchableOpacity : View;
  return (
    <Tag
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.chip, size === 'sm' && styles.chipSm, selected && styles.chipSelected]}>
      {leading}
      {icon ? <Text style={styles.iconText}>{icon}</Text> : null}
      <Text
        numberOfLines={1}
        style={[styles.label, size === 'sm' && styles.labelSm, selected && styles.labelSelected]}>
        {label}
      </Text>
    </Tag>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  chipSm: {
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipSelected: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.primary,
  },
  iconText: {
    fontSize: 14,
    color: colors.onSurface,
  },
  label: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  labelSm: {
    fontSize: 13,
    lineHeight: 18,
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
