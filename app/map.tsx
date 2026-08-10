import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { Product } from '@/src/types';
import { distanceFromCenter } from '@/src/utils/filter';
import { distanceLabel, formatCompact, formatCurrency } from '@/src/utils/format';

const HCM_CENTER = { latitude: 10.762622, longitude: 106.660172, latitudeDelta: 0.1, longitudeDelta: 0.1 };

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products } = useStore();

  const [selected, setSelected] = useState<Product | null>(null);
  const [region, setRegion] = useState(HCM_CENTER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeProducts = useMemo(
    () => products.filter((p) => p.status === 'active' && p.location),
    [products],
  );

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Không thể truy cập vị trí của bạn. Vui lòng bật quyền định vị trong cài đặt.');
        setLoading(false);
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        });
      } catch {
        // fallback to HCM center
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const recenter = async () => {
    setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Không thể truy cập vị trí của bạn.');
      setLoading(false);
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch {
      setRegion(HCM_CENTER);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <MapView
        style={StyleSheet.absoluteFill}
        region={region}
        onRegionChangeComplete={(r) => setRegion(r)}
        showsUserLocation
        showsMyLocationButton={false}>
        {activeProducts.map((product) => (
          <Marker
            key={product.id}
            coordinate={{ latitude: product.location?.latitude ?? 0, longitude: product.location?.longitude ?? 0 }}
            onPress={() => setSelected(product)}
            tracksViewChanges={false}>
            <View
              style={[
                styles.marker,
                selected?.id === product.id && styles.markerSelected,
              ]}>
              <View style={styles.markerPill}>
                <Text
                  style={[
                    styles.markerText,
                    selected?.id === product.id && styles.markerTextSelected,
                  ]}>
                  {formatCompact(product.price)}
                </Text>
              </View>
              <View
                style={[
                  styles.markerTip,
                  selected?.id === product.id && styles.markerTipSelected,
                ]}
              />
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/search')}
          style={styles.searchBar}>
          <Ionicons name="search" size={19} color={colors.onSurfaceVariant} />
          <Text style={styles.searchPlaceholder}>Tìm kiếm khu vực...</Text>
          <Ionicons name="options-outline" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={recenter}
          style={styles.locationButton}>
          <Ionicons name="locate" size={18} color={colors.primary} />
          <Text style={styles.locationButtonText}>Sử dụng vị trí hiện tại</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerOverlay}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorCard}>
          <Ionicons name="location-outline" size={20} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {selected ? (
        <View
          style={[
            styles.productCard,
            { marginBottom: insets.bottom + 12, paddingBottom: 12 },
          ]}>
          <Image source={{ uri: selected.images[0] || selected.image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <View style={styles.categoryRow}>
              <Text style={styles.categoryTag}>{selected.category}</Text>
              <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="heart-outline" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
            <Text style={styles.productTitle} numberOfLines={2}>
              {selected.title}
            </Text>
            <View style={styles.distanceRow}>
              <Ionicons name="location-outline" size={15} color={colors.onSurfaceVariant} />
              <Text style={styles.distanceText}>
                Cách bạn {distanceLabel(distanceFromCenter(selected.location.latitude, selected.location.longitude))}
              </Text>
            </View>
            <View style={styles.buyRow}>
              <Text style={styles.productPrice}>{formatCurrency(selected.price)}</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push(`/product/${selected.id}`)}
                style={styles.detailButton}>
                <Text style={styles.detailButtonText}>Xem chi tiết</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  marker: {
    alignItems: 'center',
  },
  markerPill: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(0,74,198,0.2)',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    ...shadow.level1,
  },
  markerText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  markerSelected: {
    transform: [{ scale: 1.08 }],
  },
  markerTextSelected: {
    color: colors.onPrimary,
  },
  markerTip: {
    borderLeftColor: 'transparent',
    borderLeftWidth: 6,
    borderRightColor: 'transparent',
    borderRightWidth: 6,
    borderTopColor: colors.surfaceContainerLowest,
    borderTopWidth: 8,
    height: 0,
    marginTop: -1,
    width: 0,
  },
  markerTipSelected: {
    borderTopColor: colors.primary,
  },
  header: {
    alignItems: 'flex-start',
    gap: 10,
    left: 0,
    paddingHorizontal: 20,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    ...shadow.level1,
  },
  searchPlaceholder: {
    color: 'rgba(67,70,85,0.7)',
    flex: 1,
    fontSize: 16,
  },
  locationButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...shadow.level1,
  },
  locationButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  centerOverlay: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(248,249,255,0.8)',
    borderRadius: radius.full,
    bottom: 180,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    width: 56,
    ...shadow.level1,
  },
  errorCard: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.errorContainer,
    borderRadius: radius.xl,
    bottom: 180,
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
  },
  errorText: {
    color: colors.onErrorContainer,
    flex: 1,
    fontSize: 13,
  },
  productCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.2)',
    borderRadius: radius['2xl'],
    borderWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: 16,
    left: 20,
    padding: 16,
    position: 'absolute',
    right: 20,
    ...shadow.level3,
  },
  productImage: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.lg,
    height: 100,
    width: 100,
  },
  productInfo: {
    flex: 1,
    gap: 4,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  categoryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryTag: {
    backgroundColor: 'rgba(0,74,198,0.1)',
    borderRadius: radius.full,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
    textTransform: 'uppercase',
  },
  productTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontSize: 18,
    lineHeight: 24,
  },
  distanceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  distanceText: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
  },
  buyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productPrice: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '600',
  },
  detailButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  detailButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
});
