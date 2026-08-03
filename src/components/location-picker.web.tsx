import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@/src/theme/colors';
import { LocationPoint } from '@/src/types';

type LocationPickerProps = {
  value: LocationPoint;
  onChange: (location: LocationPoint) => void;
  title?: string;
};

export function LocationPicker({
  value,
  onChange,
  title = 'Vị trí chính xác',
}: LocationPickerProps) {
  const [locating, setLocating] = useState(false);

  async function useCurrentLocation() {
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        return;
      }
      const current = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = current.coords;
      onChange({
        latitude,
        longitude,
        address: `Vị trí ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      });
    } finally {
      setLocating(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.webNotice}>
        <Ionicons name="map-outline" size={28} color={colors.primary} />
        <Text style={styles.noticeText}>
          Bản đồ tương tác được tối ưu cho Android/iOS. Bạn vẫn có thể lấy tọa độ trình duyệt.
        </Text>
      </View>
      <TouchableOpacity onPress={useCurrentLocation} style={styles.button}>
        {locating ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Ionicons name="locate" size={20} color={colors.primary} />
        )}
        <Text style={styles.buttonText}>Dùng vị trí hiện tại</Text>
      </TouchableOpacity>
      <Text style={styles.address}>{value.address}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 18 },
  title: { color: colors.ink, fontSize: 14, fontWeight: '800', marginBottom: 8 },
  webNotice: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 12,
    minHeight: 120,
    padding: 18,
  },
  noticeText: { color: colors.inkMuted, flex: 1, fontSize: 13, lineHeight: 19 },
  button: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 44,
  },
  buttonText: { color: colors.primaryDark, fontSize: 14, fontWeight: '700' },
  address: { color: colors.ink, fontSize: 13, lineHeight: 19, marginTop: 8 },
});
