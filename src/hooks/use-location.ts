import * as Location from 'expo-location';
import { useState } from 'react';

export type UseLocationResult = {
  location: { latitude: number; longitude: number; address: string } | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setError('Vui lòng bật GPS trên thiết bị rồi thử lại.');
        setLoading(false);
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setError('Cần quyền vị trí để xác định vị trí chính xác.');
        setLoading(false);
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = current.coords;

      let address = `Vị trí ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      try {
        const result = await Location.reverseGeocodeAsync({ latitude, longitude });
        const first = result[0];
        if (first) {
          const parts = [
            first.name,
            first.street,
            first.district,
            first.city,
            first.region,
          ].filter(Boolean);
          address = parts.join(', ') || address;
        }
      } catch {
        // giữ tọa độ nếu reverse geocode lỗi
      }

      setLocation({ latitude, longitude, address });
    } catch {
      setError('Không lấy được vị trí. Hãy kiểm tra GPS hoặc vị trí mô phỏng.');
    } finally {
      setLoading(false);
    }
  };

  return { location, loading, error, refresh };
}
