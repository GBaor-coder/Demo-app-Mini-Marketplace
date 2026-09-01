import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { MapPressEvent, Marker, MarkerDragStartEndEvent } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ScreenHeader } from '@/src/components/ui';
import { colors, radius, shadow } from '@/src/theme/colors';
import { LocationPoint } from '@/src/types';
import { setLocationSelectionResult } from '@/src/utils/location-selection-result';

const DEFAULT = { latitude: 10.762622, longitude: 106.660172, address: '' };

function formatAddress(address: Location.LocationGeocodedAddress | undefined) {
  if (!address) return '';
  if (address.formattedAddress) return address.formattedAddress;
  return [address.name, address.street, address.district, address.city, address.region]
    .filter(Boolean)
    .filter((item, index, all) => all.indexOf(item) === index)
    .join(', ');
}

export default function LocationSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ lat?: string; lng?: string; address?: string }>();
  const mapRef = useRef<MapView>(null);
  const reverseGeocodeRequest = useRef(0);

  const parsedLatitude = Number(params.lat);
  const parsedLongitude = Number(params.lng);
  const hasInitialPoint =
    params.lat !== undefined &&
    params.lng !== undefined &&
    Number.isFinite(parsedLatitude) &&
    Number.isFinite(parsedLongitude);

  const [point, setPoint] = useState<LocationPoint>({
    latitude: hasInitialPoint ? parsedLatitude : DEFAULT.latitude,
    longitude: hasInitialPoint ? parsedLongitude : DEFAULT.longitude,
    address: params.address ?? '',
  });
  const [gpsState, setGpsState] = useState<'idle' | 'locating' | 'denied' | 'off'>('idle');
  const [geocoding, setGeocoding] = useState(false);
  const [locationReady, setLocationReady] = useState(hasInitialPoint);

  useEffect(() => {
    if (hasInitialPoint) {
      if (!params.address) {
        void reverseGeocode(parsedLatitude, parsedLongitude);
      }
    } else {
      void locateCurrentPosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function reverseGeocode(latitude: number, longitude: number) {
    const requestId = ++reverseGeocodeRequest.current;
    setGeocoding(true);
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      const address = formatAddress(result[0]);
      if (requestId === reverseGeocodeRequest.current && address) {
        setPoint((p) => ({ ...p, address }));
      }
    } catch {
      // Tọa độ vẫn có thể được xác nhận khi dịch vụ địa chỉ tạm thời không phản hồi.
    } finally {
      if (requestId === reverseGeocodeRequest.current) {
        setGeocoding(false);
      }
    }
  }

  async function moveTo(latitude: number, longitude: number, animate = true) {
    setPoint({ latitude, longitude, address: '' });
    setLocationReady(true);
    if (animate) {
      mapRef.current?.animateToRegion(
        { latitude, longitude, latitudeDelta: 0.006, longitudeDelta: 0.006 },
        500
      );
    }
    await reverseGeocode(latitude, longitude);
  }

  async function locateCurrentPosition() {
    setGpsState('locating');
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setGpsState('off');
        setLocationReady(true);
        return;
      }
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setGpsState('denied');
        setLocationReady(true);
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setGpsState('idle');
      await moveTo(current.coords.latitude, current.coords.longitude);
    } catch {
      setGpsState('off');
      setLocationReady(true);
    }
  }

  function handleDragEnd(event: MarkerDragStartEndEvent) {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    void moveTo(latitude, longitude, false);
  }

  function handleMapPress(event: MapPressEvent) {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    void moveTo(latitude, longitude, false);
  }

  function confirm() {
    const finalAddress = point.address.trim() || `Vị trí ${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`;
    setLocationSelectionResult({
      latitude: point.latitude,
      longitude: point.longitude,
      address: finalAddress,
    });
    router.back();
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Chọn vị trí giao hàng" />

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: point.latitude,
          longitude: point.longitude,
          latitudeDelta: 0.009,
          longitudeDelta: 0.009,
        }}
        onPress={handleMapPress}
        showsCompass={false}
        showsMyLocationButton={false}
        showsUserLocation>
        <Marker
          coordinate={{ latitude: point.latitude, longitude: point.longitude }}
          draggable
          onDragEnd={handleDragEnd}
          pinColor={colors.primaryContainer}
        />
      </MapView>

      {!locationReady ? (
        <View style={styles.locatingOverlay}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.locatingText}>Đang lấy vị trí hiện tại...</Text>
        </View>
      ) : null}

      <View style={styles.gpsWrap}>
        <TouchableOpacity
          onPress={locateCurrentPosition}
          disabled={gpsState === 'locating'}
          style={styles.gpsBtn}>
          {gpsState === 'locating' ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Ionicons name="locate" size={22} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {gpsState === 'denied' ? (
        <View style={styles.notice}>
          <Ionicons name="location-outline" size={18} color={colors.error} />
          <Text style={styles.noticeText}>
            Không có quyền truy cập vị trí. Bạn vẫn có thể kéo marker trên bản đồ.
          </Text>
        </View>
      ) : null}
      {gpsState === 'off' ? (
        <View style={styles.notice}>
          <Ionicons name="warning-outline" size={18} color={colors.error} />
          <Text style={styles.noticeText}>
            GPS đang tắt. Bật GPS hoặc kéo marker trên bản đồ để chọn vị trí.
          </Text>
        </View>
      ) : null}

      <View style={[styles.bottomCard, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.addressRow}>
          <View style={styles.addressIcon}>
            <Ionicons name="location" size={20} color={colors.primary} />
          </View>
          <Text style={styles.address} numberOfLines={3}>
            {point.address ||
              `Đang xác định địa chỉ tại ${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`}
          </Text>
        </View>

        <Button
          title="Xác nhận vị trí"
          loading={geocoding || gpsState === 'locating'}
          onPress={confirm}
          style={styles.confirmBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  map: {
    flex: 1,
  },
  locatingOverlay: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    bottom: 0,
    gap: 12,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  locatingText: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '600',
  },
  gpsWrap: {
    position: 'absolute',
    right: 16,
    top: '6%',
  },
  gpsBtn: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.full,
    height: 45,
    justifyContent: 'center',
    width: 45,
    ...shadow.level2,
  },
  notice: {
    alignItems: 'center',
    backgroundColor: colors.errorContainer,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 8,
    left: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'absolute',
    right: 16,
    top: 72,
    zIndex: 5,
  },
  noticeText: {
    color: colors.onErrorContainer,
    flex: 1,
    fontSize: 13,
  },
  bottomCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    padding: 20,
    ...shadow.level3,
  },
  addressRow: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,74,198,0.06)',
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  addressIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.1)',
    borderRadius: radius.full,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  address: {
    color: colors.onSurface,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  confirmBtn: {
    marginTop: 14,
  },
});
