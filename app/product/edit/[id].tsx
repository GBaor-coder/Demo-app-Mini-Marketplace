import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductForm } from '@/src/components/product-form';
import { EmptyState } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors } from '@/src/theme/colors';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentUser, products, updateProduct } = useStore();
  const product = products.find((item) => item.id === id);

  if (!product || product.sellerId !== currentUser?.id) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState
          description="Sản phẩm không tồn tại hoặc bạn không có quyền chỉnh sửa."
          icon="alert-circle-outline"
          title="Không thể mở sản phẩm"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Quay lại" onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Chỉnh sửa sản phẩm</Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {product.title}
          </Text>
        </View>
      </View>
      <ProductForm
        initialProduct={product}
        onSubmit={(input) => {
          if (!updateProduct(product.id, input)) {
            Alert.alert('Không thể cập nhật', 'Vui lòng thử lại sau.');
            return;
          }
          Alert.alert('Đã lưu thay đổi', 'Thông tin sản phẩm đã được cập nhật.', [
            { text: 'Xong', onPress: () => router.back() },
          ]);
        }}
        submitTitle="Lưu thay đổi"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerText: { flex: 1 },
  title: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  subtitle: { color: colors.inkMuted, fontSize: 12, marginTop: 2 },
});
