import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, MaterialIcons, toIconName } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders } = useStore();
  const latest = orders[0];

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.center}>
        <View style={styles.card}>
          <View style={styles.heroCircle}>
            <MaterialIcons name={toIconName('checkmark_circle')} size={48} color={colors.tertiaryContainer} />
          </View>

          <Text style={styles.title}>Cảm ơn bạn đã mua hàng!</Text>
          <Text style={styles.subtitle}>
            Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.
          </Text>

          {latest ? (
            <View style={styles.panel}>
              <View style={styles.panelRow}>
                <Text style={styles.panelLabel}>Mã đơn hàng</Text>
                <Text style={styles.panelValuePrimary}>{latest.id}</Text>
              </View>
              <View style={styles.panelRow}>
                <Text style={styles.panelLabel}>Trạng thái</Text>
                <Text style={styles.panelValue}>Chờ xác nhận</Text>
              </View>
              <View style={styles.panelRow}>
                <Text style={styles.panelLabel}>Phương thức</Text>
                <Text style={styles.panelValue}>
                  {latest.deliveryMethod === 'meetup' ? 'Gặp mặt trực tiếp' : 'Giao tận nơi (COD)'}
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Button
              title="Xem đơn hàng"
              onPress={() => router.replace('/(tabs)/(buyer)/orders')}
              style={styles.primaryBtn}
            />
            <Button
              title="Tiếp tục mua sắm"
              variant="outline"
              onPress={() => router.replace('/(tabs)/(buyer)')}
              style={styles.secondaryBtn}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    maxWidth: 400,
    padding: 24,
    width: '100%',
    ...shadow.level2,
  },
  heroCircle: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,126,55,0.1)',
    borderRadius: radius.full,
    height: 96,
    justifyContent: 'center',
    marginBottom: 24,
    width: 96,
  },
  title: {
    ...typography.displayLgMobile,
    color: colors.onSurface,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: 24,
    textAlign: 'center',
  },
  panel: {
    backgroundColor: 'rgba(211,228,254,0.3)',
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 10,
    marginBottom: 24,
    padding: 16,
  },
  panelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  panelLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  panelValue: {
    ...typography.button,
    color: colors.onSurface,
  },
  panelValuePrimary: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '600',
  },
  actions: {
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.lg,
    minHeight: 52,
  },
  secondaryBtn: {
    backgroundColor: '#E2E8F0',
    borderRadius: radius.lg,
    borderColor: 'transparent',
    minHeight: 52,
  },
});
