import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { MapPressEvent, Marker, MarkerDragStartEndEvent } from 'react-native-maps';

import { colors, radius, shadow } from '@/src/theme/colors';
import { LocationPoint } from '@/src/types';

type LocationPickerProps = {
  value: LocationPoint;
  onChange: (location: LocationPoint) => void;
  title?: string;
};

function formatAddress(address: Location.LocationGeocodedAddress | undefined) {
  if (!address) {
    return '';
  }

  if (address.formattedAddress) {
    return address.formattedAddress;
  }

  return [address.name, address.street, address.district, address.city, address.region]
    .filter(Boolean)
    .filter((item, index, all) => all.indexOf(item) === index)
    .join(', ');
}

export function LocationPicker({
  value,
  onChange,
  title = 'Vị trí chính xác',
}: LocationPickerProps) {
  const mapRef = useRef<MapView>(null);
  const [locating, setLocating] = useState(false);

  async function updatePoint(latitude: number, longitude: number) {
    let address = `Vị trí ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      address = formatAddress(result[0]) || address;
    } catch {
      // Tọa độ vẫn được lưu khi dịch vụ chuyển đổi địa chỉ chưa phản hồi.
    }

    onChange({ latitude, longitude, address });
  }

  async function useCurrentLocation() {
    setLocating(true);
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert('Chưa bật vị trí', 'Vui lòng bật GPS trên thiết bị rồi thử lại.');
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(
          'Cần quyền vị trí',
          'UniLoop cần quyền vị trí để đặt ghim giao nhận chính xác.'
        );
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = current.coords;
      await updatePoint(latitude, longitude);
      mapRef.current?.animateToRegion(
        { latitude, longitude, latitudeDelta: 0.006, longitudeDelta: 0.006 },
        500
      );
    } catch {
      Alert.alert(
        'Không lấy được vị trí',
        'Hãy kiểm tra GPS hoặc thiết lập vị trí mô phỏng trên emulator.'
      );
    } finally {
      setLocating(false);
    }
  }

  function handleMapPress(event: MapPressEvent) {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    void updatePoint(latitude, longitude);
  }

  function handleDragEnd(event: MarkerDragStartEndEvent) {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    void updatePoint(latitude, longitude);
  }

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View style={styles.headingText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.hint}>Chạm bản đồ hoặc kéo ghim để điều chỉnh</Text>
        </View>
        <TouchableOpacity
          accessibilityLabel="Dùng vị trí hiện tại"
          disabled={locating}
          onPress={useCurrentLocation}
          style={styles.locateButton}>
          {locating ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Ionicons name="locate" size={20} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.mapFrame}>
        <MapView
          initialRegion={{
            latitude: value.latitude,
            longitude: value.longitude,
            latitudeDelta: 0.009,
            longitudeDelta: 0.009,
          }}
          mapPadding={{ top: 12, right: 12, bottom: 12, left: 12 }}
          onPress={handleMapPress}
          ref={mapRef}
          showsCompass={false}
          showsMyLocationButton={false}
          showsUserLocation
          style={styles.map}>
          <Marker
            coordinate={{ latitude: value.latitude, longitude: value.longitude }}
            draggable
            onDragEnd={handleDragEnd}
            pinColor={colors.primaryContainer}
          />
        </MapView>
      </View>

      <View style={styles.addressRow}>
        <Ionicons name="location" size={19} color={colors.primaryContainer} />
        <Text style={styles.address}>{value.address}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  headingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  headingText: {
    flex: 1,
  },
  title: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '700',
  },
  hint: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 2,
  },
  locateButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
    ...shadow.level1,
  },
  mapFrame: {
    borderColor: colors.outlineVariant,
    borderRadius: radius.xl,
    borderWidth: 1,
    height: 255,
    overflow: 'hidden',
  },
  map: {
    height: '100%',
    width: '100%',
  },
  addressRow: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,74,198,0.06)',
    borderRadius: radius.xl,
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    padding: 11,
  },
  address: {
    color: colors.onSurface,
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});
