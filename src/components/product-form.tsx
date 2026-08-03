import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { LocationPicker } from '@/src/components/location-picker';
import { FormField, PrimaryButton, SectionHeading } from '@/src/components/ui';
import { CATEGORIES, DEFAULT_LOCATION } from '@/src/data/seed';
import { colors } from '@/src/theme/colors';
import { Product, ProductCondition, ProductInput } from '@/src/types';

const CONDITIONS: ProductCondition[] = ['Như mới', 'Tốt', 'Đã qua sử dụng'];

type ProductFormProps = {
  initialProduct?: Product;
  submitTitle: string;
  onSubmit: (input: ProductInput) => void;
};

export function ProductForm({ initialProduct, submitTitle, onSubmit }: ProductFormProps) {
  const [title, setTitle] = useState(initialProduct?.title ?? '');
  const [description, setDescription] = useState(initialProduct?.description ?? '');
  const [price, setPrice] = useState(initialProduct ? String(initialProduct.price) : '');
  const [stock, setStock] = useState(initialProduct ? String(initialProduct.stock) : '1');
  const [category, setCategory] = useState<ProductInput['category']>(
    initialProduct?.category ?? 'Sách cũ'
  );
  const [condition, setCondition] = useState<ProductCondition>(
    initialProduct?.condition ?? 'Tốt'
  );
  const [image, setImage] = useState(initialProduct?.image ?? '');
  const [location, setLocation] = useState(initialProduct?.location ?? DEFAULT_LOCATION);

  async function openLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền thư viện ảnh', 'Vui lòng cấp quyền để chọn ảnh sản phẩm.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.82,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }

  async function openCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền máy ảnh', 'Vui lòng cấp quyền để chụp ảnh sản phẩm.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.82,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }

  function handleSubmit() {
    const parsedPrice = Number(price.replace(/\D/g, ''));
    const parsedStock = Number(stock);

    if (!title.trim() || title.trim().length < 5) {
      Alert.alert('Thiếu tên sản phẩm', 'Tên sản phẩm cần có ít nhất 5 ký tự.');
      return;
    }
    if (!description.trim() || description.trim().length < 20) {
      Alert.alert('Mô tả quá ngắn', 'Hãy mô tả sản phẩm rõ hơn, tối thiểu 20 ký tự.');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Giá chưa hợp lệ', 'Giá sản phẩm phải lớn hơn 0.');
      return;
    }
    if (!Number.isInteger(parsedStock) || parsedStock <= 0) {
      Alert.alert('Tồn kho chưa hợp lệ', 'Số lượng phải là số nguyên lớn hơn 0.');
      return;
    }
    if (!image) {
      Alert.alert('Chưa có ảnh', 'Vui lòng chụp hoặc chọn ít nhất một ảnh sản phẩm.');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      price: parsedPrice,
      stock: parsedStock,
      category,
      condition,
      image,
      location,
    });
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <SectionHeading title="Hình ảnh sản phẩm" />
      <View style={styles.imageArea}>
        {image ? (
          <Image contentFit="cover" source={{ uri: image }} style={styles.preview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={38} color={colors.primary} />
            <Text style={styles.imagePlaceholderTitle}>Thêm ảnh rõ nét</Text>
            <Text style={styles.imagePlaceholderText}>Ảnh ngang tỉ lệ 4:3 sẽ hiển thị đẹp nhất</Text>
          </View>
        )}
      </View>
      <View style={styles.imageActions}>
        <TouchableOpacity onPress={openLibrary} style={styles.imageButton}>
          <Ionicons name="images-outline" size={19} color={colors.primary} />
          <Text style={styles.imageButtonText}>Thư viện</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={openCamera} style={styles.imageButton}>
          <Ionicons name="camera-outline" size={20} color={colors.primary} />
          <Text style={styles.imageButtonText}>Chụp ảnh</Text>
        </TouchableOpacity>
      </View>

      <SectionHeading title="Thông tin sản phẩm" />
      <FormField
        label="Tên sản phẩm"
        maxLength={80}
        onChangeText={setTitle}
        placeholder="Ví dụ: Giáo trình Kinh tế vi mô"
        value={title}
      />
      <FormField
        label="Mô tả chi tiết"
        maxLength={500}
        multiline
        onChangeText={setDescription}
        placeholder="Tình trạng, phụ kiện đi kèm, thời gian đã sử dụng..."
        value={description}
      />
      <View style={styles.inlineFields}>
        <View style={styles.inlineField}>
          <FormField
            keyboardType="numeric"
            label="Giá bán (đ)"
            onChangeText={setPrice}
            placeholder="150000"
            value={price}
          />
        </View>
        <View style={styles.stockField}>
          <FormField
            keyboardType="number-pad"
            label="Số lượng"
            maxLength={3}
            onChangeText={setStock}
            placeholder="1"
            value={stock}
          />
        </View>
      </View>

      <Text style={styles.choiceLabel}>Danh mục</Text>
      <View style={styles.choiceWrap}>
        {CATEGORIES.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setCategory(item)}
            style={[styles.choice, category === item && styles.choiceActive]}>
            <Text style={[styles.choiceText, category === item && styles.choiceTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.choiceLabel}>Tình trạng</Text>
      <View style={styles.choiceWrap}>
        {CONDITIONS.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setCondition(item)}
            style={[styles.choice, condition === item && styles.choiceActive]}>
            <Text style={[styles.choiceText, condition === item && styles.choiceTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <LocationPicker
        onChange={setLocation}
        title="Điểm hẹn nhận sản phẩm"
        value={location}
      />

      <PrimaryButton icon="checkmark-circle" onPress={handleSubmit} title={submitTitle} />
      <Text style={styles.footnote}>
        Khi đăng, bạn xác nhận thông tin sản phẩm và vị trí hẹn gặp là chính xác.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 42,
  },
  imageArea: {
    aspectRatio: 4 / 3,
    backgroundColor: colors.primarySoft,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    overflow: 'hidden',
  },
  preview: {
    height: '100%',
    width: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  imagePlaceholderTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
  },
  imagePlaceholderText: {
    color: colors.inkMuted,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  imageActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 26,
    marginTop: 10,
  },
  imageButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 44,
  },
  imageButtonText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },
  inlineFields: {
    flexDirection: 'row',
    gap: 10,
  },
  inlineField: {
    flex: 1,
  },
  stockField: {
    width: 105,
  },
  choiceLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  choiceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  choice: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  choiceActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  choiceText: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  choiceTextActive: {
    color: colors.white,
  },
  footnote: {
    color: colors.inkMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    textAlign: 'center',
  },
});
