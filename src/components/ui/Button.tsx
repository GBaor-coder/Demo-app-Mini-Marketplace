import { ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { IconName, MaterialIcons } from './Icon';
import { colors, radius, shadow } from '@/src/theme/colors';

export type ButtonVariant =
  | 'primary'
  | 'primaryContainer'
  | 'tonal'
  | 'outline'
  | 'ghost'
  | 'danger';

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  danger?: boolean;
  style?: any;
};

const SIZES = {
  sm: 40,
  md: 48,
  lg: 56,
};

function resolveColor(variant: ButtonVariant, disabled: boolean) {
  switch (variant) {
    case 'primary':
    case 'primaryContainer':
    case 'danger':
      return colors.onPrimary;
    case 'tonal':
      return colors.onSurface;
    case 'outline':
      return colors.primary;
    default:
      return colors.primary;
  }
}

export function Button({
  title,
  onPress,
  variant = 'primaryContainer',
  icon,
  disabled,
  loading,
  size = 'md',
  fullWidth,
  danger,
  style,
}: Props) {
  const isDisabled = Boolean(disabled || loading);
  const height = SIZES[size];
  const fg = danger && variant === 'outline' ? colors.error : resolveColor(variant, isDisabled);

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.base,
        { minHeight: height },
        variant === 'primary' && styles.variantPrimary,
        variant === 'primaryContainer' && styles.variantPrimaryContainer,
        variant === 'tonal' && styles.variantTonal,
        variant === 'outline' && styles.variantOutline,
        variant === 'ghost' && styles.variantGhost,
        variant === 'danger' && styles.variantDanger,
        danger && variant === 'outline' && styles.variantDangerOutline,
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} size={size === 'sm' ? 'small' : 'small'} />
      ) : (
        <>
          {icon ? <MaterialIcons name={icon} size={size === 'sm' ? 18 : 20} color={fg} /> : null}
          <Text numberOfLines={1} style={[styles.text, size === 'sm' && styles.textSm, { color: fg }]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

type IconButtonProps = {
  name: IconName;
  onPress?: () => void;
  size?: number;
  color?: string;
  disabled?: boolean;
  style?: any;
  children?: ReactNode;
  filled?: boolean;
  accessibilityLabel?: string;
};

export function IconButton({
  name,
  onPress,
  size = 24,
  color = colors.onSurface,
  disabled,
  style,
  children,
  filled,
  accessibilityLabel,
}: IconButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[styles.iconButton, style]}>
      {children ?? <MaterialIcons name={name} size={size} color={color} />}
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
    paddingHorizontal: 24,
  },
  fullWidth: {
    width: '100%',
  },
  variantPrimary: {
    backgroundColor: colors.primary,
    ...shadow.primary,
  },
  variantPrimaryContainer: {
    backgroundColor: colors.primaryContainer,
    ...shadow.primary,
  },
  variantTonal: {
    backgroundColor: colors.surfaceContainer,
  },
  variantOutline: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    borderWidth: 1.5,
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
    borderWidth: 1.5,
  },
  disabled: {
    opacity: 0.48,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  textSm: {
    fontSize: 14,
    lineHeight: 20,
  },
});
