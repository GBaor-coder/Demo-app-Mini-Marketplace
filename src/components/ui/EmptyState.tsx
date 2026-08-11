import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { IconName, MaterialIcons } from './Icon';
import { colors, typography } from '@/src/theme/colors';

type EmptyStateProps = {
  icon: IconName;
  title: string;
  description?: string;
  children?: ReactNode;
  iconSize?: number;
  circleSize?: number;
};

export function EmptyState({
  icon,
  title,
  description,
  children,
  iconSize = 80,
  circleSize = 192,
}: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { width: circleSize, height: circleSize }]}>
        <MaterialIcons name={icon} size={iconSize} color={colors.primary} style={{ opacity: 0.2 }} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 999,
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  description: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 280,
  },
  actions: {
    marginTop: 24,
    width: '100%',
  },
});
