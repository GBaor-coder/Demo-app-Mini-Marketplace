import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { LocationPicker } from '@/src/components/location-picker';
import { Button, IconName, MaterialIcons, ScreenHeader, toIconName } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow } from '@/src/theme/colors';
import { LocationPoint } from '@/src/types';

const LABEL_OPTIONS: { label: string; icon: IconName }[] = [
  { label: 'Nhà', icon: toIconName('home') },
  { label: 'Ký túc xá', icon: toIconName('bed') },
  { label: 'Trường học', icon: toIconName('school') },
  { label: 'Công ty', icon: toIconName('business') },
];

export default function AddressFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; lat?: string; lng?: string; address?: string }>();
  const { addresses, addAddress, updateAddress } = useStore();

  const editing = params.id ? addresses.find((a) => a.id === params.id) : undefined;

  const [label, setLabel] = useState(editing?.label ?? 'Nhà');
  const [recipient, setRecipient] = useState(editing?.recipient ?? '');
  const [phone, setPhone] = useState(editing?.phone ?? '');
  const [province, setProvince] = useState(editing?.province ?? '');
  const [district, setDistrict] = useState(editing?.district ?? '');
  const [ward, setWard] = useState(editing?.ward ?? '');
  const [street, setStreet] = useState(editing?.street ?? '');
  const [building, setBuilding] = useState(editing?.building ?? '');
  const [room, setRoom] = useState(editing?.room ?? '');
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [isDefault, setIsDefault] = useState(editing?.isDefault ?? false);
  const [location, setLocation] = useState<LocationPoint>(
    editing?.location ?? { latitude: 10.762622, longitude: 106.660172, address: '' }
  );
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (params.lat && params.lng) {
        setLocation({
          latitude: Number(params.lat),
          longitude: Number(params.lng),
          address: params.address ?? '',
        });
      }
    }, [params.lat, params.lng, params.address])
  );

  const save = () => {
    if (recipient.trim().length < 2) {
      Alert.alert('Thiếu tên người nhận', 'Vui lòng nhập tên người nhận.');
      return;
    }
    if (!/^[0-9+]{9,12}$/.test(phone.trim())) {
      Alert.alert('Số điện thoại không hợp lệ', 'Vui lòng nhập số điện thoại đúng định dạng.');
      return;
    }
    if (!street.trim()) {
      Alert.alert('Thiếu địa chỉ', 'Vui lòng nhập tên đường / địa chỉ cụ thể.');
      return;
    }
    if (!location.address) {
      Alert.alert('Thiếu vị trí', 'Vui lòng xác định vị trí trên bản đồ.');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      const data = {
        label: label.trim() || 'Nhà',
        recipient: recipient.trim(),
        phone: phone.trim(),
        province,
        district,
        ward,
        street: street.trim(),
        building: building.trim(),
        room: room.trim(),
        location,
        isDefault,
        notes: notes.trim(),
      };
      if (editing) {
        updateAddress(editing.id, data);
      } else {
        addAddress(data);
      }
      setSaving(false);
      router.back();
    }, 500);
  };

  const openMapPicker = () => {
    router.push('/location-select');
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title={editing ? 'Sửa địa chỉ' : 'Thêm địa chỉ'} />

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.fieldLabel}>NGƯỜI NHẬN</Text>
        <TextInput
          value={recipient}
          onChangeText={setRecipient}
          placeholder="Họ và tên người nhận"
          placeholderTextColor={colors.outline}
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>SỐ ĐIỆN THOẠI</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Số điện thoại"
          placeholderTextColor={colors.outline}
          keyboardType="phone-pad"
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>TỈNH/THÀNH</Text>
        <TextInput
          value={province}
          onChangeText={setProvince}
          placeholder="VD: Đồng Tháp"
          placeholderTextColor={colors.outline}
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>QUẬN/HUYỆN</Text>
        <TextInput
          value={district}
          onChangeText={setDistrict}
          placeholder="VD: Thành phố Cao Lãnh"
          placeholderTextColor={colors.outline}
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>PHƯỜNG/XÃ</Text>
        <TextInput
          value={ward}
          onChangeText={setWard}
          placeholder="VD: Phường Mỹ Phú"
          placeholderTextColor={colors.outline}
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>ĐỊA CHỈ CỤ THỂ</Text>
        <TextInput
          value={street}
          onChangeText={setStreet}
          placeholder="Số nhà, tên đường"
          placeholderTextColor={colors.outline}
          style={styles.input}
        />

        <View style={styles.inlineRow}>
          <View style={styles.inlineField}>
            <Text style={styles.fieldLabel}>TÒA NHÀ/KÝ TÚC XÁ</Text>
            <TextInput
              value={building}
              onChangeText={setBuilding}
              placeholder="VD: Ký túc xá KTX Bách Khoa"
              placeholderTextColor={colors.outline}
              style={styles.input}
            />
          </View>
          <View style={styles.roomField}>
            <Text style={styles.fieldLabel}>PHÒNG</Text>
            <TextInput
              value={room}
              onChangeText={setRoom}
              placeholder="A2-501"
              placeholderTextColor={colors.outline}
              style={styles.input}
            />
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.85} onPress={openMapPicker} style={styles.mapToggle}>
          <View style={styles.mapToggleIcon}>
            <MaterialIcons name="map" size={20} color={colors.primary} />
          </View>
          <View style={styles.mapToggleInfo}>
            <Text style={styles.mapToggleTitle}>Chọn vị trí trên bản đồ</Text>
            <Text style={styles.mapToggleSub} numberOfLines={1}>
              {location.address || 'Xác định vị trí chính xác để giao hàng'}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={colors.outline} />
        </TouchableOpacity>

        {location.address ? <LocationPicker onChange={setLocation} value={location} /> : null}

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>LOẠI ĐỊA CHỈ</Text>
          <View style={styles.labelGrid}>
            {LABEL_OPTIONS.map((option) => {
              const selected = label === option.label;
              return (
                <TouchableOpacity
                  key={option.label}
                  activeOpacity={0.85}
                  onPress={() => setLabel(option.label)}
                  style={[styles.labelPill, selected && styles.labelPillActive]}>
                  <MaterialIcons
                    name={option.icon}
                    size={18}
                    color={selected ? colors.primary : colors.onSurfaceVariant}
                  />
                  <Text style={[styles.labelPillText, selected && styles.labelPillTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>GHI CHÚ</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Ghi chú thêm cho người giao (không bắt buộc)"
            placeholderTextColor={colors.outline}
            multiline
            style={[styles.input, styles.textarea]}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setIsDefault((v) => !v)}
          style={styles.defaultRow}>
          <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
            {isDefault ? <MaterialIcons name="check" size={14} color={colors.onPrimary} /> : null}
          </View>
          <Text style={styles.defaultText}>Đặt làm địa chỉ mặc định</Text>
        </TouchableOpacity>

        <Button
          title={editing ? 'Lưu thay đổi' : 'Lưu địa chỉ'}
          loading={saving}
          onPress={save}
          style={styles.saveBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  body: {
    padding: 20,
    paddingBottom: 40,
  },
  fieldGroup: {
    marginBottom: 6,
  },
  fieldLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 14,
  },
  labelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  labelPill: {
    alignItems: 'center',
    borderColor: colors.outlineVariant,
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 18,
  },
  labelPillActive: {
    backgroundColor: 'rgba(0,74,198,0.2)',
    borderColor: colors.primary,
  },
  labelPillText: {
    color: colors.onSurfaceVariant,
    fontSize: 15,
    fontWeight: '500',
  },
  labelPillTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: colors.onSurface,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inlineField: {
    flex: 1,
  },
  roomField: {
    width: 110,
  },
  mapToggle: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    padding: 14,
    ...shadow.level1,
  },
  mapToggleIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  mapToggleInfo: {
    flex: 1,
    gap: 2,
  },
  mapToggleTitle: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  mapToggleSub: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
  defaultRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.outlineVariant,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  defaultText: {
    color: colors.onSurface,
    fontSize: 14,
  },
  saveBtn: {
    marginTop: 24,
  },
});
