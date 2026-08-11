import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaterialIcons } from './Icon';
import { colors, radius, typography } from '@/src/theme/colors';

type LogoutModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export function LogoutModal({ visible, onClose, onConfirm, loading }: LogoutModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={[styles.wrap, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Đóng"
        />
        <View style={styles.dialog}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="logout" size={28} color={colors.error} />
          </View>
          <Text style={styles.title}>Xác nhận đăng xuất</Text>
          <Text style={styles.text}>Bạn có chắc chắn muốn đăng xuất khỏi UniLoop?</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              disabled={loading}
              style={[styles.button, styles.cancelButton]}>
              <Text style={[styles.buttonText, styles.cancelText]}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onConfirm}
              disabled={loading}
              style={[styles.button, styles.confirmButton]}>
              <Text style={[styles.buttonText, styles.confirmText]}>
                {loading ? 'Đang xử lý...' : 'Đăng xuất'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(11,28,48,0.40)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  dialog: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    maxWidth: 400,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    width: '100%',
    elevation: 6,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(186,26,26,0.10)',
    borderRadius: radius.full,
    height: 48,
    justifyContent: 'center',
    marginBottom: 16,
    width: 48,
  },
  title: {
    ...typography.headlineSmMobile,
    color: colors.onSurface,
    fontWeight: '700',
    marginBottom: 8,
  },
  text: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: 24,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  cancelButton: {
    backgroundColor: colors.surfaceContainer,
  },
  confirmButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  cancelText: {
    color: colors.onSurfaceVariant,
  },
  confirmText: {
    color: colors.onError,
  },
});
