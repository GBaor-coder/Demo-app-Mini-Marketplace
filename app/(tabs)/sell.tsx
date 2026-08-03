import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductForm } from '@/src/components/product-form';
import { useStore } from '@/src/context/store-context';
import { colors } from '@/src/theme/colors';

export default function SellScreen() {
  const { currentUser, addProduct } = useStore();

  if (currentUser?.role !== 'seller') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Đăng bán</Text>
          <Text style={styles.subtitle}>Thông tin rõ ràng giúp sản phẩm bán nhanh hơn</Text>
        </View>
        <View style={styles.iconBox}>
          <Ionicons name="pricetag-outline" size={22} color={colors.primary} />
        </View>
      </View>
      <ProductForm
        onSubmit={(input) => {
          const product = addProduct(input);
          if (!product) {
            Alert.alert('Không thể đăng bán', 'Tài khoản hiện tại không có quyền người bán.');
            return;
          }
          Alert.alert('Đăng bán thành công', 'Sản phẩm đã xuất hiện trong gian hàng.', [
            { text: 'Về gian hàng', onPress: () => router.replace('/(tabs)') },
          ]);
        }}
        submitTitle="Đăng sản phẩm"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  title: {
    color: colors.ink,
    fontSize: 23,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.inkMuted,
    fontSize: 12,
    marginTop: 3,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
});
