import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors, radius } from '@/src/theme/colors';

type InputProps = TextInputProps & {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  hint?: string;
  right?: ReactNode;
  containerStyle?: any;
};

export function Input({
  label,
  icon,
  error,
  hint,
  right,
  containerStyle,
  multiline,
  style,
  ...props
}: InputProps) {
  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.box,
          multiline && styles.boxMultiline,
          error ? styles.boxError : null,
        ]}>
        {icon ? (
          <Ionicons name={icon} size={19} color={colors.onSurfaceVariant} style={styles.icon} />
        ) : null}
        <TextInput
          {...props}
          multiline={multiline}
          placeholderTextColor={colors.outline}
          style={[styles.input, multiline && styles.inputMultiline, style]}
        />
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

type PressableInputProps = {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  value?: string;
  placeholder?: string;
  error?: string;
  onPress: () => void;
  containerStyle?: any;
  right?: ReactNode;
};

export function PressableInput({
  label,
  icon,
  value,
  placeholder,
  error,
  onPress,
  containerStyle,
  right,
}: PressableInputProps) {
  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[styles.box, error ? styles.boxError : null]}>
        {icon ? (
          <Ionicons name={icon} size={19} color={colors.onSurfaceVariant} style={styles.icon} />
        ) : null}
        <Text
          numberOfLines={1}
          style={[styles.input, value ? styles.value : styles.placeholder]}>
          {value || placeholder}
        </Text>
        {right ?? (
          <Ionicons name="chevron-down" size={18} color={colors.outline} />
        )}
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  box: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  boxMultiline: {
    alignItems: 'flex-start',
    minHeight: 116,
    paddingTop: 14,
  },
  boxError: {
    borderColor: colors.error,
  },
  icon: {},
  input: {
    color: colors.onSurface,
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    paddingVertical: 12,
  },
  inputMultiline: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  value: {
    color: colors.onSurface,
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  placeholder: {
    color: colors.outline,
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  right: {},
  error: {
    color: colors.error,
    fontSize: 13,
    lineHeight: 18,
  },
  hint: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
  },
});
