import { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { IconName, MaterialIcons } from './Icon';
import { colors, radius, typography } from '@/src/theme/colors';

type ChipProps = {
  label: string;
  icon?: IconName;
  selected?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md';
  leading?: ReactNode;
  color?: string;
};

export function Chip({
  label,
  icon,
  selected,
  onPress,
  size = 'md',
  leading,
  color = colors.primary,
}: ChipProps) {
  const Tag = onPress ? TouchableOpacity : View;
  return (
    <Tag
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.chip,
        size === 'sm' && styles.chipSm,
        selected && { ...styles.chipSelected, borderColor: `${color}33` },
      ]}>
      {leading}
      {icon ? <MaterialIcons name={icon} size={size === 'sm' ? 16 : 18} color={selected ? color : colors.onSurfaceVariant} /> : null}
      <Text
        numberOfLines={1}
        style={[styles.label, size === 'sm' && styles.labelSm, selected && { color, fontWeight: '600' }]}>
        {label}
      </Text>
    </Tag>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.outlineVariant,
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    flexShrink: 0,
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
    backgroundColor: 'rgba(0,74,198,0.10)',
  },
  label: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  labelSm: {
    fontSize: 13,
    lineHeight: 18,
  },
});
