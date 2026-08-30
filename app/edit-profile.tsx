import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/Avatar';
import { Button, EmptyState, Input, MaterialIcons } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { CAMPUSES, filterCampuses } from '@/src/data/campuses';
import { deleteAvatarFile, uploadAvatar } from '@/src/lib/image-upload';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { ProfileUpdateInput } from '@/src/types';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, updateProfile } = useStore();

  const [name, setName] = useState(currentUser?.name ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [campus, setCampus] = useState(currentUser?.campus ?? '');
  const [bio, setBio] = useState(currentUser?.bio ?? '');
  const [avatarUri, setAvatarUri] = useState(currentUser?.avatar ?? '');
  const [avatarPicked, setAvatarPicked] = useState(false);
  const [campusFocused, setCampusFocused] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!currentUser) {
    return (
      <View style={styles.screen}>
        <EmptyState
          icon="person"
          title="Vui lòng đăng nhập"
          description="Bạn cần đăng nhập để chỉnh sửa hồ sơ.">
          <Button title="Đăng nhập" onPress={() => router.replace('/login')} />
        </EmptyState>
      </View>
    );
  }

  const suggestions =
    campusFocused && !CAMPUSES.includes(campus.trim())
      ? filterCampuses(campus)
      : [];

  const user = currentUser;

  async function pickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền thư viện ảnh', 'Vui lòng cấp quyền để chọn ảnh đại diện.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled) return;

    setAvatarUri(result.assets[0].uri);
    setAvatarPicked(true);
  }

  async function handleSave() {
    setError('');

    if (!name.trim()) {
      setError('Vui lòng nhập họ và tên.');
      return;
    }
    if (!/^0\d{9}$/.test(phone.trim())) {
      setError('Số điện thoại không hợp lệ. Cần 10 chữ số bắt đầu bằng 0.');
      return;
    }
    if (!campus.trim()) {
      setError('Vui lòng nhập trường học.');
      return;
    }

    setSaving(true);
    try {
      const input: ProfileUpdateInput = {
        name: name.trim(),
        phone: phone.trim(),
        campus: campus.trim(),
        bio: bio.trim(),
      };

      if (avatarPicked && avatarUri) {
        const url = await uploadAvatar(avatarUri, user.id);
        input.avatar = url;
        if (user.avatar && user.avatar !== url) {
          void deleteAvatarFile(user.avatar);
        }
      }

      await updateProfile(input);

      Alert.alert('Cập nhật thành công', 'Hồ sơ của bạn đã được lưu.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu hồ sơ. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}>
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.card}>
            <View style={styles.avatarSection}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={pickAvatar}
                style={styles.avatarWrap}>
                <Avatar uri={avatarUri} name={user.name} size={104} />
                <View style={styles.avatarBadge}>
                  <MaterialIcons name="camera" size={18} color={colors.onPrimary} />
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Chạm để đổi ảnh đại diện</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email"
                icon="mail"
                boxRadius={radius.sm}
                value={user.email}
                editable={false}
                hint="Email đăng nhập không thể thay đổi."
              />
              <Input
                label="Họ và tên"
                icon="person"
                boxRadius={radius.sm}
                value={name}
                onChangeText={setName}
                placeholder="Nhập họ và tên của bạn"
              />
              <Input
                label="Số điện thoại"
                icon="phone"
                boxRadius={radius.sm}
                value={phone}
                onChangeText={setPhone}
                placeholder="0xxxxxxxxx"
                keyboardType="phone-pad"
              />

              <View style={styles.campusField}>
                <Input
                  label="Trường học"
                  icon="school"
                  boxRadius={radius.sm}
                  value={campus}
                  onChangeText={(t) => {
                    setCampus(t);
                    setCampusFocused(true);
                  }}
                  onFocus={() => setCampusFocused(true)}
                  onBlur={() => setTimeout(() => setCampusFocused(false), 150)}
                  placeholder="Gõ tìm hoặc nhập tên trường"
                />
                {suggestions.length > 0 && (
                  <View style={styles.suggestionCard}>
                    {suggestions.map((suggestion) => (
                      <TouchableOpacity
                        key={suggestion}
                        activeOpacity={0.7}
                        onPress={() => {
                          setCampus(suggestion);
                          setCampusFocused(false);
                        }}
                        style={styles.suggestionRow}>
                        <MaterialIcons name="school" size={18} color={colors.primary} />
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <Input
                label="Giới thiệu bản thân"
                icon="description"
                boxRadius={radius.sm}
                value={bio}
                onChangeText={setBio}
                placeholder="Chia sẻ ngắn gọn về bạn (tùy chọn)"
                multiline
                maxLength={200}
                hint={bio.length > 0 ? `${bio.length}/200` : undefined}
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              title="Lưu thay đổi"
              variant="primary"
              loading={saving}
              onPress={handleSave}
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.9)',
    flexDirection: 'row',
    height: 64,
    paddingHorizontal: 8,
    ...shadow.level1,
  },
  headerBtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    ...typography.headlineMd,
    color: colors.primary,
    flex: 1,
    fontSize: 18,
    textAlign: 'center',
  },
  scroll: {
    padding: 20,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    gap: 20,
    padding: 24,
    width: '100%',
    ...shadow.level1,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 8,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarBadge: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.surfaceContainerLowest,
    borderRadius: radius.full,
    borderWidth: 2,
    bottom: 0,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 32,
  },
  avatarHint: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  form: {
    gap: 14,
  },
  campusField: {
    position: 'relative',
    zIndex: 10,
  },
  suggestionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.outlineVariant,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginTop: 2,
    overflow: 'hidden',
  },
  suggestionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionText: {
    ...typography.bodySm,
    color: colors.onSurface,
    flex: 1,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
  },
});