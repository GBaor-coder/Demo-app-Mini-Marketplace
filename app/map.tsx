import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, MaterialIcons } from '@/src/components/ui';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { normalizeSearch } from '@/src/utils/format';
import { setLocationDraft } from '@/src/utils/location-draft';

const HCM_CENTER = { latitude: 10.762622, longitude: 106.660172 };

const SUGGESTIONS = [
  {
    title: 'Cổng D5, Đại học Bách Khoa TP.HCM',
    address: '268 Lý Thường Kiệt, P.14, Q.10, TP. HCM',
    latitude: 10.762622,
    longitude: 106.660172,
  },
  {
    title: 'Thư viện trung tâm ĐH Bách Khoa',
    address: '268 Lý Thường Kiệt, P.14, Q.10, TP. HCM',
    latitude: 10.760925,
    longitude: 106.660656,
  },
  {
    title: 'KTX Khu B, ĐHQG TP.HCM',
    address: 'KP6, Linh Trung, TP. Thủ Đức, TP. HCM',
    latitude: 10.882096,
    longitude: 106.803155,
  },
  {
    title: 'Trường ĐH Kinh tế TP.HCM',
    address: '59C Nguyễn Đình Chiểu, Q.3, TP. HCM',
    latitude: 10.775928,
    longitude: 106.685033,
  },
  {
    title: 'Cổng A, ĐH Sư phạm Kỹ thuật',
    address: '01 Võ Văn Ngân, Linh Chiểu, TP. Thủ Đức, TP. HCM',
    latitude: 10.850808,
    longitude: 106.771873,
  },
];

function formatAddress(address: Location.LocationGeocodedAddress | undefined) {
  if (!address) return '';
  if (address.formattedAddress) return address.formattedAddress;
  return [address.name, address.street, address.district, address.city, address.region]
    .filter(Boolean)
    .filter((item, index, all) => all.indexOf(item) === index)
    .join(', ');
}

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ lat?: string; lng?: string; address?: string }>();
  const searchRef = useRef<TextInput>(null);

  const [_coords, setCoords] = useState({
    latitude: params.lat ? Number(params.lat) : HCM_CENTER.latitude,
    longitude: params.lng ? Number(params.lng) : HCM_CENTER.longitude,
  });
  const [address, setAddress] = useState(params.address ?? '');
  const [detail, setDetail] = useState(params.address ?? '');
  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [denied, setDenied] = useState(false);

  const results = useMemo(() => {
    const q = normalizeSearch(query.trim());
    if (!q) return [];
    return SUGGESTIONS.filter((item) =>
      normalizeSearch(`${item.title} ${item.address}`).includes(q)
    );
  }, [query]);

  const locate = useCallback(async () => {
    setLocating(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setDenied(true);
      setLocating(false);
      return;
    }
    setDenied(false);
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      const result = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      const text = formatAddress(result[0]);
      if (text) setAddress(text);
    } catch {
      setCoords(HCM_CENTER);
    } finally {
      setLocating(false);
    }
  }, []);

  useEffect(() => {
    void locate();
  }, [locate]);

  const retry = () => {
    setDenied(false);
    void locate();
  };

  const selectSuggestion = (item: (typeof SUGGESTIONS)[number]) => {
    setCoords({ latitude: item.latitude, longitude: item.longitude });
    setAddress(item.address);
    setDetail(item.address);
    setQuery('');
    Keyboard.dismiss();
  };

  const confirm = () => {
    const finalAddress = detail.trim() || address;
    if (!finalAddress) {
      Alert.alert('Chọn vị trí', 'Vui lòng chọn hoặc nhập địa chỉ giao hàng.');
      return;
    }
    setLocationDraft({ latitude: _coords.latitude, longitude: _coords.longitude, address: finalAddress });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <Text style={styles.title}>Bản đồ chọn vị trí</Text>
      </View>

      <View style={styles.mapArea}>
        <View style={styles.dotGrid}>
          {Array.from({ length: 420 }).map((_, index) => (
            <View key={index} style={styles.dot} />
          ))}
        </View>

        <View style={styles.centerPin} pointerEvents="none">
          <View style={styles.pinBubble}>
            <Text style={styles.pinBubbleText}>Giao đến đây</Text>
          </View>
          <MaterialIcons name="location-on" size={40} color={colors.primary} style={styles.pinIcon} />
        </View>

        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={colors.onSurfaceVariant} />
            <TextInput
              ref={searchRef}
              value={query}
              onChangeText={setQuery}
              placeholder="Tìm kiếm địa chỉ..."
              placeholderTextColor="rgba(67,70,85,0.7)"
              style={styles.searchInput}
            />
          </View>
          {results.length ? (
            <ScrollView
              style={styles.suggestionCard}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {results.map((item, index) => (
                <TouchableOpacity
                  key={item.title}
                  activeOpacity={0.8}
                  onPress={() => selectSuggestion(item)}
                  style={[
                    styles.suggestionRow,
                    index === results.length - 1 && styles.suggestionRowLast,
                  ]}>
                  <View style={styles.suggestionIcon}>
                    <MaterialIcons name="place" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.suggestionInfo}>
                    <Text style={styles.suggestionTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.suggestionAddress} numberOfLines={1}>
                      {item.address}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={locate}
          disabled={locating}
          style={styles.locateBtn}>
          {locating ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <MaterialIcons name="my-location" size={22} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {locating ? (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={styles.loadingText}>Đang tải vị trí...</Text>
          </View>
        </View>
      ) : null}

      {denied ? (
        <View style={styles.deniedOverlay}>
          <View style={styles.deniedCard}>
            <View style={styles.deniedIcon}>
              <MaterialIcons name="location-off" size={32} color={colors.error} />
            </View>
            <Text style={styles.deniedTitle}>Không có quyền truy cập vị trí</Text>
            <Text style={styles.deniedText}>
              Vui lòng cấp quyền truy cập vị trí trong cài đặt để sử dụng tính năng này.
            </Text>
            <Button title="Thử lại" variant="primary" fullWidth onPress={retry} />
          </View>
        </View>
      ) : null}

      <View style={[styles.bottomCard, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={styles.fieldLabel}>Tỉnh/Thành phố, Quận/Huyện, Phường/Xã</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => searchRef.current?.focus()}
          style={styles.addressRow}>
          <Text style={styles.addressText} numberOfLines={1}>
            {address || 'Chọn vị trí từ bản đồ'}
          </Text>
          <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <Text style={styles.fieldLabel}>Địa chỉ cụ thể (Số nhà, tên đường...)</Text>
        <TextInput
          value={detail}
          onChangeText={setDetail}
          placeholder="Nhập địa chỉ cụ thể"
          placeholderTextColor={colors.outline}
          style={styles.detailInput}
          multiline
        />
        <Button
          title="Xác nhận vị trí"
          variant="primary"
          fullWidth
          onPress={confirm}
          style={styles.confirmBtn}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomColor: 'rgba(195,198,215,0.2)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  headerBtn: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
    flex: 1,
  },
  mapArea: {
    backgroundColor: '#e5e5e5',
    flex: 1,
    minHeight: 300,
    overflow: 'hidden',
  },
  dotGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dot: {
    backgroundColor: '#cbd5e1',
    borderRadius: 1,
    height: 2,
    margin: 9,
    width: 2,
  },
  centerPin: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: '38%',
  },
  pinBubble: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    ...shadow.level2,
  },
  pinBubbleText: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '500',
  },
  pinIcon: {
    textShadowColor: 'rgba(15,23,42,0.25)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  searchWrap: {
    left: 20,
    position: 'absolute',
    right: 20,
    top: 16,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 4,
    ...shadow.level1,
  },
  searchInput: {
    color: colors.onSurface,
    flex: 1,
    fontSize: 16,
    minHeight: 44,
    paddingVertical: 8,
  },
  suggestionCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: 8,
    maxHeight: 260,
    ...shadow.level2,
  },
  suggestionRow: {
    alignItems: 'center',
    borderBottomColor: 'rgba(195,198,215,0.2)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionRowLast: {
    borderBottomWidth: 0,
  },
  suggestionIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.full,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionTitle: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  suggestionAddress: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 1,
  },
  locateBtn: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.full,
    borderWidth: 1,
    bottom: 16,
    height: 48,
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    width: 48,
    ...shadow.level2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.5)',
    justifyContent: 'center',
    zIndex: 50,
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    ...shadow.level2,
  },
  loadingText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: '500',
  },
  deniedOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.8)',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 60,
  },
  deniedCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
    maxWidth: 320,
    padding: 24,
    width: '100%',
    ...shadow.level3,
  },
  deniedIcon: {
    alignItems: 'center',
    backgroundColor: colors.errorContainer,
    borderRadius: radius.full,
    height: 64,
    justifyContent: 'center',
    marginBottom: 16,
    width: 64,
  },
  deniedTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    marginBottom: 8,
    textAlign: 'center',
  },
  deniedText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginBottom: 20,
    textAlign: 'center',
  },
  bottomCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    borderTopWidth: 1,
    gap: 8,
    padding: 20,
    ...shadow.level3,
  },
  fieldLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  addressRow: {
    alignItems: 'center',
    borderBottomColor: 'rgba(195,198,215,0.3)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
  },
  addressText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
  },
  detailInput: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.onSurface,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  confirmBtn: {
    marginTop: 12,
  },
});
