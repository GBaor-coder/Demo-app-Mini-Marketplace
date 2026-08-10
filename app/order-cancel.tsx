import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';

const REASONS = [
  'Thay đổi ý định',
  'Tìm thấy giá tốt hơn',
  'Người bán không phản hồi',
  'Khác...',
];

const SELLER_REASONS = [
  'Hàng đã hết hoặc không còn trong kho',
  'Không thể liên hệ với người mua',
  'Địa chỉ giao hàng không hợp lệ',
  'Giá sản phẩm cần điều chỉnh',
  'Khác...',
];

const OTHER_LABEL = 'Khác...';

export default function OrderCancelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, seller } = useLocalSearchParams<{ id: string; seller?: string }>();
  const { updateOrderStatus } = useStore();

  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isSellerFlow = seller === '1';
  const reasons = isSellerFlow ? SELLER_REASONS : REASONS;

  const confirm = () => {
    if (!reason) {
      Alert.alert('Chọn lý do', 'Vui lòng chọn một lý do hủy đơn hàng.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const finalReason = reason === OTHER_LABEL && note.trim() ? note.trim() : reason;
      if (isSellerFlow) {
        updateOrderStatus(id, 'rejected', finalReason);
        setSubmitting(false);
        Alert.alert('Đã từ chối đơn hàng', 'Người mua sẽ được thông báo về việc từ chối đơn này.', [
          { text: 'Đóng', onPress: () => router.back() },
        ]);
        return;
      }
      updateOrderStatus(id, 'cancelled', finalReason);
      setSubmitting(false);
      Alert.alert('Đã hủy đơn hàng', 'Đơn hàng đã được hủy. Tiền sẽ được hoàn vào ví UniLoop.', [
        { text: 'Đóng', onPress: () => router.back() },
      ]);
    }, 500);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isSellerFlow ? 'Lý do từ chối đơn' : 'Lý do hủy đơn'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {isSellerFlow
                ? 'Vui lòng cho chúng tôi biết lý do bạn muốn từ chối đơn hàng này.'
                : 'Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này.'}
            </Text>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.reasonList}>
              {reasons.map((option) => {
                const selected = reason === option;
                return (
                  <TouchableOpacity
                    key={option}
                    activeOpacity={0.85}
                    onPress={() => setReason(option)}
                    style={[styles.reasonCard, selected && styles.reasonCardActive]}>
                    <View style={[styles.radio, selected && styles.radioActive]}>
                      {selected ? <View style={styles.radioDot} /> : null}
                    </View>
                    <Text style={[styles.reasonText, selected && styles.reasonTextActive]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {reason === OTHER_LABEL ? (
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Nhập chi tiết lý do của bạn..."
                placeholderTextColor={colors.outline}
                multiline
                style={styles.noteInput}
              />
            ) : null}
          </View>

          <View style={styles.modalActions}>
            <Button
              title={isSellerFlow ? 'Xác nhận từ chối' : 'Xác nhận hủy'}
              variant="danger"
              loading={submitting}
              fullWidth
              onPress={confirm}
            />
            <TouchableOpacity activeOpacity={0.85} onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.overlay,
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    alignSelf: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['3xl'],
    maxWidth: 400,
    overflow: 'hidden',
    width: '100%',
    ...shadow.level3,
  },
  modalHeader: {
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  modalTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  modalContent: {
    gap: 12,
    paddingHorizontal: 24,
  },
  reasonList: {
    gap: 8,
  },
  reasonCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.outlineVariant,
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  reasonCardActive: {
    backgroundColor: 'rgba(0,74,198,0.05)',
    borderColor: colors.primary,
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
    borderColor: colors.primary,
  },
  radioDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 10,
    width: 10,
  },
  reasonText: {
    color: colors.onSurface,
    fontSize: 15,
    flex: 1,
  },
  reasonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  noteInput: {
    backgroundColor: colors.surface,
    borderColor: colors.outlineVariant,
    borderRadius: radius.xl,
    borderWidth: 1,
    color: colors.onSurface,
    fontSize: 14,
    minHeight: 80,
    padding: 14,
    textAlignVertical: 'top',
  },
  modalActions: {
    gap: 12,
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backBtn: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.xl,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 20,
  },
  backBtnText: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
});
