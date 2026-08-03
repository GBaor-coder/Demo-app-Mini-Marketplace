import { Ionicons } from '@expo/vector-icons';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@/src/theme/colors';
import { LocationPoint } from '@/src/types';

export function LocationPreview({ location }: { location: LocationPoint }) {
  function openExternalMap() {
    void Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="location" size={22} color={colors.accent} />
      <Text style={styles.address}>{location.address}</Text>
      <TouchableOpacity onPress={openExternalMap} style={styles.button}>
        <Ionicons name="open-outline" size={18} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 9,
    padding: 14,
  },
  address: { color: colors.ink, flex: 1, fontSize: 13, lineHeight: 19 },
  button: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 6,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
});
