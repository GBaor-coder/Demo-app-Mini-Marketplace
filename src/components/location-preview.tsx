import { Ionicons } from '@expo/vector-icons';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { colors, radius, shadow } from '@/src/theme/colors';
import { LocationPoint } from '@/src/types';

export function LocationPreview({ location }: { location: LocationPoint }) {
  function openExternalMap() {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    void Linking.openURL(url);
  }

  return (
    <View>
      <View style={styles.mapFrame}>
        <MapView
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.006,
            longitudeDelta: 0.006,
          }}
          pitchEnabled={false}
          rotateEnabled={false}
          scrollEnabled={false}
          style={styles.map}
          zoomEnabled={false}>
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            pinColor={colors.primaryContainer}
          />
        </MapView>
      </View>
      <View style={styles.locationRow}>
        <Ionicons name="location" size={19} color={colors.primaryContainer} />
        <Text style={styles.address}>{location.address}</Text>
        <TouchableOpacity accessibilityLabel="Mở bản đồ" onPress={openExternalMap} style={styles.openButton}>
          <Ionicons name="open-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapFrame: {
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 188,
    overflow: 'hidden',
    ...shadow.level1,
  },
  map: {
    height: '100%',
    width: '100%',
  },
  locationRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 11,
  },
  address: {
    color: colors.onSurface,
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  openButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderRadius: radius.full,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
});
