import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';

import { LocationPoint } from '@/src/types';

const ADDRESS_LOCATION_TOLERANCE_KM = 3;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceInKilometers(first: LocationPoint, second: LocationPoint) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

export async function validateAddressLocation(address: string, selected: LocationPoint) {
  const geocoded = await Location.geocodeAsync(address);
  if (!geocoded.length) {
    return {
      valid: false,
      message:
        'Không thể xác định địa chỉ bạn đã nhập. Vui lòng kiểm tra lại tỉnh/thành, quận/huyện, phường/xã và số nhà.',
    };
  }

  const nearestDistance = Math.min(
    ...geocoded.map((candidate) =>
      distanceInKilometers(selected, {
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        address,
      })
    )
  );

  if (nearestDistance > ADDRESS_LOCATION_TOLERANCE_KM) {
    return {
      valid: false,
      message: `Địa chỉ đã nhập cách vị trí ghim khoảng ${nearestDistance.toFixed(
        1
      )} km. Vui lòng chọn lại vị trí trên bản đồ hoặc sửa địa chỉ (chỉ cho phép chênh lệch tối đa ${ADDRESS_LOCATION_TOLERANCE_KM} km).`,
    };
  }

  return { valid: true, message: '' };
}

export async function openMapLink(latitude: number, longitude: number) {
  const geoUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
  const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  const open = async (url: string) => {
    try {
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
        return true;
      }
    } catch {
      // ignore and fall through
    }
    return false;
  };

  if (Platform.OS === 'android') {
    const opened = await open(geoUrl);
    if (opened) return;
    await open(webUrl);
    return;
  }

  await open(webUrl);
}
