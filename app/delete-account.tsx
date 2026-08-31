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

import { Button, Input, MaterialIcons, ScreenHeader } from '@/src/components/ui';
import { supabase } from '@/src/lib/supabase';
import { colors, radius, shadow, typography } from '@/src/theme/colors';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setError('');

    if (!password) {
      setError('Vui lòng nhập mật khẩu để xác nhận.');
      return;
    }

    Alert.alert(
      'Xác nhận xóa tài khoản',
      'Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tài khoản',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const { data: userData } = await supabase.auth.getUser();
              if (!userData.user?.email) {
                setError('Không thể xác định tài khoản. Vui lòng thử lại.');
                setLoading(false);
                return;
              }

              const { error: signInError } = await supabase.auth.signInWithPassword({
                email: userData.user.email,
                password,
              });

              if (signInError) {
                setError('Mật khẩu không đúng. Vui lòng nhập lại.');
                setLoading(false);
                return;
              }

              const { error: deleteError } = await supabase.rpc('delete_current_user');

              if (deleteError) {
                await supabase.auth.signOut();
                setError('Không thể xóa tài khoản. Vui lòng liên hệ hỗ trợ.');
                setLoading(false);
                return;
              }

              await supabase.auth.signOut();
              Alert.alert('Thành công', 'Tài khoản của bạn đã được xóa.', [
                { text: 'OK', onPress: () => router.replace('/login') },
              ]);
            } catch {
              setError('Lỗi kết nối. Vui lòng thử lại sau.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}>
      <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
        <ScreenHeader title="Xóa tài khoản" />

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.card}>
            <View style={styles.decoTop} />

            <View style={styles.warningIcon}>
              <MaterialIcons name="warning" size={48} color={colors.error} />
            </View>

            <Text style={styles.title}>Xóa tài khoản?</Text>
            <Text style={styles.subtitle}>
              Hành động này không thể hoàn tác. Khi xóa, toàn bộ dữ liệu sau sẽ bị mất vĩnh viễn:
            </Text>

            <View style={styles.list}>
              <View style={styles.listItem}>
                <MaterialIcons name="person-remove" size={20} color={colors.error} />
                <Text style={styles.listItemText}>Thông tin tài khoản và hồ sơ</Text>
              </View>
              <View style={styles.listItem}>
                <MaterialIcons name="shopping-bag" size={20} color={colors.error} />
                <Text style={styles.listItemText}>Lịch sử mua hàng và đơn hàng</Text>
              </View>
              <View style={styles.listItem}>
                <MaterialIcons name="storefront" size={20} color={colors.error} />
                <Text style={styles.listItemText}>Sản phẩm đang đăng bán</Text>
              </View>
              <View style={styles.listItem}>
                <MaterialIcons name="chat" size={20} color={colors.error} />
                <Text style={styles.listItemText}>Tin nhắn và cuộc trò chuyện</Text>
              </View>
            </View>

            <View style={styles.confirmSection}>
              <Text style={styles.confirmLabel}>
                Nhập mật khẩu để xác nhận xóa tài khoản:
              </Text>
              <Input
                icon="lock"
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu hiện tại"
                secureTextEntry={!showPassword}
                right={
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialIcons
                      name={showPassword ? 'visibility' : 'visibility-off'}
                      size={20}
                      color={colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                }
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              title="Xóa tài khoản vĩnh viễn"
              variant="danger"
              loading={loading}
              onPress={handleDelete}
            />

            <Button
              title="Hủy"
              variant="ghost"
              onPress={() => router.back()}
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
    backgroundColor: colors.background,
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
    color: colors.error,
    flex: 1,
    fontSize: 18,
    textAlign: 'center',
  },
  scroll: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    maxWidth: 480,
    overflow: 'hidden',
    padding: 28,
    position: 'relative',
    width: '100%',
    gap: 16,
    ...shadow.level1,
  },
  decoTop: {
    backgroundColor: 'rgba(186,26,26,0.05)',
    borderRadius: 64,
    height: 128,
    position: 'absolute',
    right: -48,
    top: -48,
    width: 128,
  },
  warningIcon: {
    alignItems: 'center',
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  list: {
    gap: 8,
  },
  listItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  listItemText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  confirmSection: {
    gap: 8,
  },
  confirmLabel: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
  },
});
