import { Ionicons } from '@expo/vector-icons';
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

import { Button } from '@/src/components/ui';
import { colors, radius, shadow, typography } from '@/src/theme/colors';

const REASONS = [
  'Sản phẩm giả mạo',
  'Lừa đảo',
  'Ngôn từ không phù hợp',
  'Giá ảo',
  'Khác',
];

export default function ReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState('Khác');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = () => {
    if (!reason) {
      Alert.alert('Chọn lý do', 'Vui lòng chọn lý do báo cáo.');
      return;
    }
    if (description.trim().length < 10) {
      Alert.alert('Mô tả quá ngắn', 'Hãy mô tả chi tiết hơn, tối thiểu 10 ký tự.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert('Đã gửi báo cáo', 'Cảm ơn bạn đã phản hồi. Đội ngũ UniLoop sẽ xem xét trong 24 giờ.', [
        { text: 'Đóng', onPress: () => router.back() },
      ]);
    }, 600);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Báo cáo vi phạm</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Vui lòng chọn lý do chính xác để chúng tôi có thể xử lý báo cáo của bạn một cách nhanh chóng.
        </Text>

        <Text style={styles.sectionLabel}>Lý do báo cáo</Text>
        {REASONS.map((option) => {
          const selected = reason === option;
          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.85}
              onPress={() => setReason(option)}
              style={[styles.reasonRow, selected && styles.reasonRowActive]}>
              <View style={[styles.radio, selected && styles.radioActive]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
              <Text style={styles.reasonText}>{option}</Text>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.sectionLabel}>Chi tiết (Tùy chọn)</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Cung cấp thêm thông tin chi tiết về vấn đề này..."
          placeholderTextColor={colors.outline}
          multiline
          style={styles.textarea}
        />

        <View style={styles.notice}>
          <Ionicons name="information-circle" size={20} color={colors.error} />
          <Text style={styles.noticeText}>
            Báo cáo sai sự thật có thể dẫn đến việc tài khoản của bạn bị hạn chế các tính năng.
          </Text>
        </View>

        <Button
          title="Gửi báo cáo"
          variant="danger"
          icon="flag-outline"
          loading={submitting}
          onPress={submit}
          style={styles.submitBtn}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={[styles.cancelBtn, { marginBottom: insets.bottom + 12 }]}>
          <Text style={styles.cancelText}>Hủy</Text>
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: 'rgba(248,249,255,0.94)',
    flexDirection: 'row',
    paddingBottom: 10,
    paddingHorizontal: 12,
    ...shadow.level1,
  },
  headerBtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  title: {
    ...typography.headlineSm,
    color: colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  body: {
    padding: 20,
  },
  intro: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: 24,
  },
  sectionLabel: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: '600',
    marginBottom: 16,
  },
  reasonRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    padding: 16,
  },
  reasonRowActive: {
    borderColor: colors.primaryContainer,
  },
  reasonText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
  },
  radio: {
    alignItems: 'center',
    borderColor: colors.outlineVariant,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioActive: {
    borderColor: colors.primaryContainer,
  },
  radioDot: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
    height: 10,
    width: 10,
  },
  textarea: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: radius.xl,
    borderWidth: 1,
    color: colors.onSurface,
    fontSize: 14,
    minHeight: 130,
    padding: 16,
    textAlignVertical: 'top',
  },
  notice: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,218,214,0.2)',
    borderColor: 'rgba(255,218,214,0.3)',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    padding: 16,
  },
  noticeText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  submitBtn: {
    marginTop: 24,
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
});
