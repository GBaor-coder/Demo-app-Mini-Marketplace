import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { colors } from '@/src/theme/colors';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.brandRow}>
      <View style={[styles.brandIcon, compact && styles.brandIconCompact]}>
        <Ionicons name="leaf" size={compact ? 19 : 27} color={colors.white} />
      </View>
      <View>
        <Text style={[styles.brandName, compact && styles.brandNameCompact]}>UniLoop</Text>
        {!compact && <Text style={styles.brandTagline}>Chợ xanh sinh viên</Text>}
      </View>
    </View>
  );
}

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  title,
  onPress,
  icon,
  disabled,
  loading,
  variant = 'primary',
  style,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.84}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.primary : colors.white} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={variant === 'secondary' ? colors.primary : colors.white}
            />
          )}
          <Text
            style={[
              styles.buttonText,
              variant === 'secondary' && styles.buttonTextSecondary,
            ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

type FormFieldProps = TextInputProps & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
};

export function FormField({ label, icon, error, multiline, style, ...props }: FormFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldBox, multiline && styles.fieldBoxMultiline, error && styles.fieldError]}>
        {icon && <Ionicons name={icon} size={19} color={colors.inkMuted} />}
        <TextInput
          {...props}
          multiline={multiline}
          placeholderTextColor="#95A39E"
          style={[styles.fieldInput, multiline && styles.fieldInputMultiline, style]}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

export function LoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <BrandMark />
      <ActivityIndicator color={colors.primary} size="large" style={styles.loadingSpinner} />
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={31} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  brandIcon: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  brandIconCompact: {
    height: 34,
    width: 34,
  },
  brandName: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '800',
  },
  brandNameCompact: {
    fontSize: 20,
  },
  brandTagline: {
    color: colors.inkMuted,
    fontSize: 13,
    marginTop: 1,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonSecondary: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  buttonDisabled: {
    opacity: 0.48,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonTextSecondary: {
    color: colors.primaryDark,
  },
  fieldGroup: {
    gap: 6,
    marginBottom: 15,
  },
  fieldLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  fieldBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  fieldBoxMultiline: {
    alignItems: 'flex-start',
    minHeight: 112,
    paddingTop: 12,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  fieldInput: {
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
  },
  fieldInputMultiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '800',
  },
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  loadingSpinner: {
    marginTop: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 46,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    height: 58,
    justifyContent: 'center',
    marginBottom: 14,
    width: 58,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDescription: {
    color: colors.inkMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    textAlign: 'center',
  },
});
