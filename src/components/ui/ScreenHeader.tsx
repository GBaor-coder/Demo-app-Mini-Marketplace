import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, typography } from '@/src/theme/colors';

type ScreenHeaderProps = {
  title?: string;
  showBack?: boolean;
  right?: ReactNode;
  onBack?: () => void;
  subtitle?: string;
  transparent?: boolean;
};

export function ScreenHeader({
  title,
  showBack = true,
  right,
  onBack,
  subtitle,
  transparent,
}: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        transparent && styles.headerTransparent,
        { paddingTop: insets.top + 6 },
      ]}>
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack ?? (() => router.back())}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        <View style={styles.center}>
          {title ? (
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.right}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  headerTransparent: {
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 48,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backButtonPlaceholder: {
    width: 40,
  },
  center: {
    flex: 1,
    paddingHorizontal: 8,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  right: {
    alignItems: 'flex-end',
    minWidth: 40,
  },
});
