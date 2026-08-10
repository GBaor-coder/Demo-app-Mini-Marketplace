import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, MarkerDragStartEndEvent } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { LocationPoint } from '@/src/types';
import { setLocationDraft } from '@/src/utils/location-draft';

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

  const [point, setPoint] = useState<LocationPoint>({
    latitude: params.lat ? Number(params.lat) : DEFAULT.latitude,
    longitude: params.lng ? Number(params.lng) : DEFAULT.longitude,
    address: params.address ?? '',
  });
  const [gpsState, setGpsState] = useState<'idle' | 'locating' | 'denied' | 'off'>('idle');
  const [manualOpen, setManualOpen] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  useEffect(() => {
    if (!point.address) {
      reverseGeocode(point.latitude, point.longitude);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function reverseGeocode(latitude: number, longitude: number) {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      const address = formatAddress(result[0]);
      if (address) {
        setPoint((p) => ({ ...p, address }));
      }
    } catch {
      // giữ nguyên địa chỉ tọa độ
    }
  }

  async function moveTo(latitude: number, longitude: number) {
    setPoint((p) => ({ ...p, latitude, longitude }));
    mapRef.current?.animateToRegion(
      { latitude, longitude, latitudeDelta: 0.006, longitudeDelta: 0.006 },
      500
    );
    await reverseGeocode(latitude, longitude);
  }

  async function useCurrentLocation() {
    setGpsState('locating');
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setGpsState('off');
        return;
      }
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setGpsState('denied');
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setGpsState('idle');
      await moveTo(current.coords.latitude, current.coords.longitude);
    } catch {
      setGpsState('off');
    }
  }

  function handleDragEnd(event: MarkerDragStartEndEvent) {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setPoint((p) => ({ ...p, latitude, longitude }));
    void reverseGeocode(latitude, longitude);
  }

  function confirm() {
    const finalAddress = point.address.trim() || `Vị trí ${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`;
    setLocationDraft({ ...point, address: finalAddress });
    router.back();
  }

  function applyManual() {
    const trimmed = manualAddress.trim();
    if (!trimmed) return;
    setPoint((p) => ({ ...p, address: trimmed }));
    setManualOpen(false);
    setManualAddress('');
    Keyboard.dismiss();
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Chọn vị trí giao hàng</Text>
        <View style={styles.headerBtn} />
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: point.latitude,
          longitude: point.longitude,
          latitudeDelta: 0.009,
          longitudeDelta: 0.009,
        }}
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

      <View style={styles.gpsWrap}>
        <TouchableOpacity
          onPress={useCurrentLocation}
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
        <View style={[styles.notice, { top: insets.top + 116 }]}>
          <Ionicons name="location-outline" size={18} color={colors.error} />
          <Text style={styles.noticeText}>
            Không có quyền truy cập vị trí. Bạn vẫn có thể chạm bản đồ hoặc nhập tay bên dưới.
          </Text>
        </View>
      ) : null}
      {gpsState === 'off' ? (
        <View style={[styles.notice, { top: insets.top + 116 }]}>
          <Ionicons name="warning-outline" size={18} color={colors.error} />
          <Text style={styles.noticeText}>
            GPS đang tắt. Bật GPS hoặc chọn vị trí bằng cách chạm bản đồ / nhập tay.
          </Text>
        </View>
      ) : null}

      <View style={[styles.bottomCard, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.addressRow}>
          <View style={styles.addressIcon}>
            <Ionicons name="location" size={20} color={colors.primary} />
          </View>
          <Text style={styles.address} numberOfLines={3}>
            {point.address || `Đang xác định địa chỉ tại ${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`}
          </Text>
        </View>

        {manualOpen ? (
          <View style={styles.manualWrap}>
            <TextInput
              value={manualAddress}
              onChangeText={setManualAddress}
              placeholder="Nhập địa chỉ cụ thể, ví dụ: 268 Lý Thường Kiệt, P.14, Q.10"
              placeholderTextColor={colors.outline}
              style={styles.manualInput}
              multiline
            />
            <Button title="Áp dụng" onPress={applyManual} style={styles.manualApply} />
          </View>
        ) : (
          <TouchableOpacity activeOpacity={0.85} onPress={() => setManualOpen(true)} style={styles.manualToggle}>
            <Ionicons name="create-outline" size={17} color={colors.primary} />
            <Text style={styles.manualToggleText}>Nhập địa chỉ bằng tay</Text>
          </TouchableOpacity>
        )}

        <Button title="Xác nhận vị trí" onPress={confirm} style={styles.confirmBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.94)',
    flexDirection: 'row',
    paddingBottom: 10,
    paddingHorizontal: 12,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
    ...shadow.level1,
  },
  headerBtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 36,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
    flex: 1,
    textAlign: 'center',
  },
  map: {
    flex: 1,
  },
  gpsWrap: {
    position: 'absolute',
    right: 16,
    top: 96,
  },
  gpsBtn: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.full,
    height: 46,
    justifyContent: 'center',
    width: 46,
    ...shadow.level2,
  },
  notice: {
    alignItems: 'center',
    backgroundColor: colors.errorContainer,
    borderRadius: radius.xl,
    flexDirection: 'row',
    gap: 8,
    left: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'absolute',
    right: 16,
    zIndex: 5,
  },
  noticeText: {
    color: colors.onErrorContainer,
    flex: 1,
    fontSize: 13,
  },
  bottomCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    padding: 20,
    ...shadow.level3,
  },
  addressRow: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,74,198,0.06)',
    borderRadius: radius.xl,
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
  manualWrap: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  manualInput: {
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.outlineVariant,
    borderRadius: radius.xl,
    borderWidth: 1,
    color: colors.onSurface,
    flex: 1,
    fontSize: 13,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  manualApply: {
    minWidth: 100,
  },
  manualToggle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  manualToggleText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtn: {
    marginTop: 14,
  },
});
