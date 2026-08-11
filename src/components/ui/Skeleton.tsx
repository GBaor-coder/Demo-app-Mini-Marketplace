import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius } from '@/src/theme/colors';

type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle | ViewStyle[];
};

export function Skeleton({ width = '100%', height = 16, radius: r = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.base, { width, height, borderRadius: r, opacity }, style]}
    />
  );
}

type SkeletonBlockProps = {
  lines?: number;
  style?: ViewStyle;
};

export function SkeletonBlock({ lines = 3, style }: SkeletonBlockProps) {
  return (
    <View style={[styles.block, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '55%' : '100%'} height={14} />
      ))}
    </View>
  );
}

type SkeletonCardProps = {
  style?: ViewStyle;
  lines?: number;
  imageHeight?: number;
};

export function SkeletonCard({ style, lines = 3, imageHeight = 160 }: SkeletonCardProps) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton width="100%" height={imageHeight} radius={radius.sm} />
      <View style={styles.cardBody}>
        <SkeletonBlock lines={lines} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surfaceVariant,
  },
  block: {
    gap: 10,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    overflow: 'hidden',
    width: '100%',
    ...{
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
  },
  cardBody: {
    padding: 12,
  },
});
