import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { colors, radius } from '@/src/theme/colors';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  compact?: boolean;
  danger?: boolean;
  style?: any;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  size = 'md',
  fullWidth,
  compact,
  danger,
  style,
}: Props) {
  const isDisabled = disabled || loading;
  const iconColor = loading
    ? variant === 'outline' || variant === 'ghost'
      ? danger
        ? colors.error
        : colors.primary
      : colors.onPrimary
    : variant === 'primary' || variant === 'danger' || variant === 'secondary'
      ? colors.onPrimary
      : variant === 'outline'
        ? danger
          ? colors.error
          : colors.onSurface
        : danger
          ? colors.error
          : colors.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.base,
        styles[size],
        variant === 'primary' && styles.variantPrimary,
        variant === 'secondary' && styles.variantSecondary,
        variant === 'outline' && styles.variantOutline,
        variant === 'ghost' && styles.variantGhost,
        variant === 'danger' && styles.variantDanger,
        danger && variant === 'outline' && styles.variantDangerOutline,
        danger && variant === 'ghost' && styles.variantDangerGhost,
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        compact && styles.compact,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          color={iconColor}
          size={size === 'sm' ? 'small' : 'small'}
          style={styles.spinner}
        />
      ) : (
        <>
          {icon ? (
            <Ionicons
              name={icon}
              size={size === 'sm' ? 16 : 18}
              color={iconColor}
              style={styles.icon}
            />
          ) : null}
          <Text
            numberOfLines={1}
            style={[
              styles.text,
              size === 'sm' && styles.textSm,
              (variant === 'primary' || variant === 'danger' || variant === 'secondary') &&
                styles.textOnPrimary,
              variant === 'outline' && styles.textOutline,
              variant === 'ghost' && styles.textGhost,
              danger && (variant === 'outline' || variant === 'ghost') && styles.textDanger,
            ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

type IconButtonProps = {
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  color?: string;
  disabled?: boolean;
  style?: any;
  children?: ReactNode;
};

export function IconButton({
  name,
  onPress,
  size = 22,
  color = colors.onSurface,
  disabled,
  style,
  children,
}: IconButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[styles.iconButton, style]}>
      {children ?? <Ionicons name={name} size={size} color={color} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  sm: {
    minHeight: 38,
    paddingHorizontal: 14,
  },
  md: {
    minHeight: 50,
  },
  lg: {
    minHeight: 56,
  },
  fullWidth: {
    width: '100%',
  },
  compact: {
    paddingHorizontal: 14,
  },
  variantPrimary: {
    backgroundColor: colors.primary,
  },
  variantSecondary: {
    backgroundColor: colors.secondaryContainer,
  },
  variantOutline: {
    backgroundColor: colors.surface,
    borderColor: colors.outlineVariant,
    borderWidth: 1,
  },
  variantGhost: {
    backgroundColor: 'transparent',
  },
  variantDanger: {
    backgroundColor: colors.error,
  },
  variantDangerOutline: {
    backgroundColor: colors.surface,
    borderColor: colors.error,
  },
  variantDangerGhost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.48,
  },
  spinner: {
    marginHorizontal: 2,
  },
  icon: {
    marginRight: 2,
  },
  text: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  textSm: {
    fontSize: 14,
    lineHeight: 20,
  },
  textOnPrimary: {
    color: colors.onPrimary,
  },
  textOutline: {
    color: colors.onSurface,
  },
  textGhost: {
    color: colors.primary,
  },
  textDanger: {
    color: colors.error,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
