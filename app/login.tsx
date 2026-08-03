import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark, FormField, PrimaryButton } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors } from '@/src/theme/colors';
import { UserRole } from '@/src/types';

const DEMO_ACCOUNTS = {
  buyer: {
    email: 'buyer@uniloop.vn',
    password: 'buyer123',
    label: 'Người mua',
    description: 'Khám phá, giỏ hàng và đặt mua',
    icon: 'bag-handle-outline' as const,
  },
  seller: {
    email: 'seller@uniloop.vn',
    password: 'seller123',
    label: 'Người đăng bán',
    description: 'Đăng tin và quản lý gian hàng',
    icon: 'storefront-outline' as const,
  },
};

export default function LoginScreen() {
  const { login } = useStore();
  const [role, setRole] = useState<UserRole>('buyer');
  const [email, setEmail] = useState(DEMO_ACCOUNTS.buyer.email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS.buyer.password);

  function chooseRole(nextRole: UserRole) {
    setRole(nextRole);
    setEmail(DEMO_ACCOUNTS[nextRole].email);
    setPassword(DEMO_ACCOUNTS[nextRole].password);
  }

  function handleLogin() {
    if (!login(email, password)) {
      Alert.alert(
        'Đăng nhập chưa thành công',
        'Email hoặc mật khẩu không đúng. Bạn có thể chọn tài khoản mẫu bên trên.'
      );
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.brandBlock}>
            <BrandMark />
            <Text style={styles.headline}>Trao đồ cũ, nối vòng xanh</Text>
            <Text style={styles.intro}>
              Mua bán an toàn trong cộng đồng sinh viên và hẹn nhận ngay gần trường.
            </Text>
          </View>

          <View style={styles.roleSection}>
            <Text style={styles.sectionLabel}>Chọn vai trò để trải nghiệm</Text>
            <View style={styles.roleRow}>
              {(Object.keys(DEMO_ACCOUNTS) as UserRole[]).map((item) => {
                const account = DEMO_ACCOUNTS[item];
                const active = role === item;
                return (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.86}
                    onPress={() => chooseRole(item)}
                    style={[styles.roleCard, active && styles.roleCardActive]}>
                    <View style={[styles.roleIcon, active && styles.roleIconActive]}>
                      <Ionicons
                        name={account.icon}
                        size={23}
                        color={active ? colors.white : colors.primary}
                      />
                    </View>
                    <Text style={[styles.roleTitle, active && styles.roleTitleActive]}>
                      {account.label}
                    </Text>
                    <Text style={[styles.roleDescription, active && styles.roleDescriptionActive]}>
                      {account.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Đăng nhập UniLoop</Text>
            <FormField
              autoCapitalize="none"
              autoComplete="email"
              icon="mail-outline"
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="name@uniloop.vn"
              value={email}
            />
            <FormField
              autoCapitalize="none"
              icon="lock-closed-outline"
              label="Mật khẩu"
              onChangeText={setPassword}
              placeholder="Nhập mật khẩu"
              secureTextEntry
              value={password}
            />
            <PrimaryButton icon="log-in-outline" onPress={handleLogin} title="Đăng nhập" />
          </View>

          <View style={styles.demoNote}>
            <Ionicons name="shield-checkmark" size={19} color={colors.primary} />
            <Text style={styles.demoNoteText}>
              Đây là tài khoản demo. Dữ liệu được lưu cục bộ trên thiết bị để tiện chấm bài.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 22,
    paddingBottom: 40,
  },
  brandBlock: {
    paddingBottom: 28,
    paddingTop: 18,
  },
  headline: {
    color: colors.ink,
    fontSize: 29,
    fontWeight: '900',
    lineHeight: 35,
    marginTop: 26,
  },
  intro: {
    color: colors.inkMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 9,
    maxWidth: 410,
  },
  roleSection: {
    marginBottom: 25,
  },
  sectionLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 145,
    padding: 13,
  },
  roleCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    marginBottom: 12,
    width: 40,
  },
  roleIconActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  roleTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  roleTitleActive: {
    color: colors.white,
  },
  roleDescription: {
    color: colors.inkMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },
  roleDescriptionActive: {
    color: 'rgba(255,255,255,0.78)',
  },
  formSection: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 23,
  },
  formTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 18,
  },
  demoNote: {
    alignItems: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 9,
    marginTop: 16,
    padding: 12,
  },
  demoNoteText: {
    color: colors.inkMuted,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
