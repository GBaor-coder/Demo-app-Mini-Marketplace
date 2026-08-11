import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from './Button';
import { IconName } from './Icon';
import { colors, shadow, typography } from '@/src/theme/colors';

type ScreenHeaderProps = {
  title?: string;
  brand?: boolean;
  showBack?: boolean;
  right?: ReactNode;
  onBack?: () => void;
  subtitle?: string;
  transparent?: boolean;
  backIcon?: IconName;
};

export function ScreenHeader({
  title,
  brand,
  showBack = true,
  right,
  onBack,
  subtitle,
  transparent,
  backIcon = 'arrow-back',
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
          <IconButton
            name={backIcon}
            onPress={onBack ?? (() => router.back())}
            color={brand ? colors.primary : colors.onSurface}
            style={styles.backButton}
          />
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        <View style={styles.center}>
          {brand ? (
            <Text style={styles.brandTitle}>UniLoop</Text>
          ) : title ? (
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
    paddingBottom: 10,
    ...shadow.level1,
  },
  headerTransparent: {
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
    shadowOpacity: 0,
    elevation: 0,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 999,
    height: 40,
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
    ...typography.headlineSmMobile,
    color: colors.onSurface,
    textAlign: 'center',
  },
  brandTitle: {
    ...typography.headlineMdMobile,
    color: colors.primary,
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
