import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';

type AvatarProps = {
  uri?: string;
  name?: string;
  size?: number;
};

export function Avatar({ uri, name = '?', size = 44 }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2 },
      ]}>
      {uri ? (
        <Image contentFit="cover" source={{ uri }} style={styles.image} />
      ) : (
        <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  initial: {
    color: colors.onPrimary,
    fontWeight: '700',
  },
});
