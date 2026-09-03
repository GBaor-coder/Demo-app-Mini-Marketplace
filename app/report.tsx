import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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

const REASONS = [
  'Thông tin sai lệch (sản phẩm khác với mô tả)',
  'Hành vi lừa đảo',
  'Nội dung vi phạm chính sách',
  'Sản phẩm cấm / không hợp lệ',
  'Khác',
];

export default function ReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(false);

  const submit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setToast(true);
      setTimeout(() => router.back(), 2000);
    }, 600);
  };

  const confirmSubmit = () => {
    if (!reason) {
      Alert.alert('Chọn lý do', 'Vui lòng chọn lý do báo cáo.');
      return;
    }
    if (reason === 'Khác' && description.trim().length < 10) {
      Alert.alert('Mô tả quá ngắn', 'Hãy mô tả chi tiết hơn, tối thiểu 10 ký tự.');
      return;
    }
    Alert.alert(
      'Xác nhận gửi báo cáo',
      'Bạn xác nhận gửi báo cáo này để hệ thống xem xét?',
      [
        { text: 'Kiểm tra lại', style: 'cancel' },
        { text: 'Gửi báo cáo', style: 'destructive', onPress: submit },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={22} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <Text style={styles.title}>Báo cáo vi phạm</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {REASONS.map((option) => {
            const selected = reason === option;
            return (
              <TouchableOpacity
                key={option}
                activeOpacity={0.85}
                onPress={() => setReason(option)}
                style={styles.reasonRow}>
                <View style={[styles.radio, selected && styles.radioActive]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
                <Text style={styles.reasonText}>{option}</Text>
              </TouchableOpacity>
            );
          })}

          {reason === 'Khác' ? (
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Vui lòng mô tả chi tiết lý do khác..."
              placeholderTextColor={colors.outline}
              multiline
              style={styles.textarea}
            />
          ) : null}
        </View>

        <Button
          title="Gửi báo cáo"
          variant="danger"
          icon="flag"
          loading={submitting}
          onPress={confirmSubmit}
          fullWidth
          style={styles.submitBtn}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={[styles.cancelBtn, { marginBottom: insets.bottom + 12 }]}>
          <Text style={styles.cancelText}>Hủy</Text>
        </TouchableOpacity>
      </ScrollView>

      {toast ? (
        <View style={[styles.toast, { bottom: insets.bottom + 96 }]}>
          <MaterialIcons name="check-circle" size={20} color={colors.tertiaryFixed} />
          <Text style={styles.toastText}>Báo cáo đã được gửi. Cảm ơn bạn đã đóng góp!</Text>
        </View>
      ) : null}
    </View>
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
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
    flex: 1,
  },
  body: {
    padding: 20,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    gap: 4,
    padding: 16,
    ...shadow.level1,
  },
  reasonRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  radio: {
    alignItems: 'center',
    borderColor: colors.outlineVariant,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    marginTop: 2,
    width: 20,
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 10,
    width: 10,
  },
  reasonText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
    lineHeight: 24,
  },
  textarea: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.onSurface,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    minHeight: 80,
    padding: 12,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: 16,
    elevation: 3,
    shadowColor: '#BA1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 14,
  },
  cancelText: {
    ...typography.button,
    color: colors.onSurfaceVariant,
  },
  toast: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.onSurface,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    zIndex: 100,
    ...shadow.level3,
  },
  toastText: {
    ...typography.bodySm,
    color: colors.surfaceContainerLowest,
    fontWeight: '500',
  },
});
