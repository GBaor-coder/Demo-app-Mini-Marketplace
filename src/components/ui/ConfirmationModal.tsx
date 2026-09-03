import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from './Button';
import { IconName, MaterialIcons } from './Icon';
import { colors, radius, shadow, typography } from '@/src/theme/colors';

type ConfirmationModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  onClose: () => void;
  onConfirm: () => void;
  cancelText?: string;
  destructive?: boolean;
  icon?: IconName;
  loading?: boolean;
};

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmText,
  onClose,
  onConfirm,
  cancelText = 'Quay lại',
  destructive = false,
  icon = 'help-outline',
  loading = false,
}: ConfirmationModalProps) {
  const insets = useSafeAreaInsets();
  const accentColor = destructive ? colors.error : colors.primary;

  return (
    <Modal
      animationType="fade"
      onRequestClose={loading ? undefined : onClose}
      statusBarTranslucent
      transparent
      visible={visible}>
      <View
        style={[
          styles.overlay,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}>
        <TouchableOpacity
          accessibilityLabel="Đóng hộp thoại xác nhận"
          activeOpacity={1}
          disabled={loading}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View accessibilityViewIsModal style={styles.dialog}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: destructive ? colors.errorContainer : colors.primaryFixed },
            ]}>
            <MaterialIcons name={icon} size={28} color={accentColor} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Button
              disabled={loading}
              onPress={onClose}
              title={cancelText}
              variant="tonal"
              style={styles.actionButton}
            />
            <Button
              loading={loading}
              onPress={onConfirm}
              title={confirmText}
              variant={destructive ? 'danger' : 'primaryContainer'}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  dialog: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
    maxWidth: 400,
    padding: 24,
    width: '100%',
    ...shadow.level3,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 52,
    justifyContent: 'center',
    marginBottom: 16,
    width: 52,
  },
  title: {
    ...typography.headlineSmMobile,
    color: colors.onSurface,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
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
  actionButton: {
    flex: 1,
    paddingHorizontal: 12,
  },
});
