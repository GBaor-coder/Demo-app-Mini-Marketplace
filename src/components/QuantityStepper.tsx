import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@/src/theme/colors';

type QuantityStepperProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: number;
};

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  size = 28,
}: QuantityStepperProps) {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - 1))}
        style={[styles.button, { width: size, height: size }, value <= min && styles.disabled]}>
        <Text style={styles.buttonText}>−</Text>
      </TouchableOpacity>
      <View style={[styles.value, { width: size + 4, height: size }]}>
        <Text style={styles.valueText}>{value}</Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + 1))}
        style={[styles.button, { width: size, height: size }, value >= max && styles.disabled]}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.outlineVariant,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 20,
  },
  value: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    color: colors.onSurface,
    fontSize: 14,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
