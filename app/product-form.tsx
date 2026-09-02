import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
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

import { LocationPicker } from '@/src/components/location-picker';
import { UploadProgress, UploadProgressItem } from '@/src/components/UploadProgress';
import { Button, EmptyState, MaterialIcons, ScreenHeader } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { uploadProductImage } from '@/src/lib/image-upload';
import { CATEGORIES, DEFAULT_LOCATION } from '@/src/data/seed';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { ProductCondition, ProductInput } from '@/src/types';

const CONDITIONS: ProductCondition[] = ['Mới', 'Như mới', 'Đã sử dụng'];

export default function ProductFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, republish } = useLocalSearchParams<{ id?: string; republish?: string }>();
  const { currentUser, products, addProduct, updateProduct } = useStore();

  const editing = id
    ? products.find((p) => p.id === id)
    : republish
      ? products.find((p) => p.id === republish)
      : undefined;
  const sourceProduct = editing;

  const isRepublish = !!republish && !id;
  const initialProduct = editing;

  const [title, setTitle] = useState(initialProduct?.title ?? '');
  const [description, setDescription] = useState(initialProduct?.description ?? '');
  const [price, setPrice] = useState(initialProduct ? String(initialProduct.price) : '');
  const [stock, setStock] = useState(
    isRepublish ? '1' : initialProduct ? String(initialProduct.stock) : '1'
  );
  const [category, setCategory] = useState(initialProduct?.category ?? CATEGORIES[0]);
  const [condition, setCondition] = useState<ProductCondition>(initialProduct?.condition ?? 'Mới');
  const [meetupPoint, setMeetupPoint] = useState(initialProduct?.meetupPoint ?? '');
  const [allowsMeetup, setAllowsMeetup] = useState(initialProduct?.allowsMeetup ?? true);
  const [allowsCod, setAllowsCod] = useState(initialProduct?.allowsCod ?? true);
  const [location, setLocation] = useState(
    initialProduct?.location ?? DEFAULT_LOCATION
  );
  const [uploads, setUploads] = useState<UploadProgressItem[]>(
    initialProduct?.images.map((uri, i) => ({
      id: `existing-${i}`,
      uri,
      name: `Ảnh ${i + 1}`,
      size: undefined,
      progress: 100,
      status: 'done',
    })) ?? []
  );
  const [submitting, setSubmitting] = useState(false);

  const doneUris = uploads.filter((u) => u.status === 'done').map((u) => u.uri);

  async function pickImages() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền thư viện ảnh', 'Vui lòng cấp quyền để chọn ảnh sản phẩm.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 6,
      quality: 0.82,
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });
    if (result.canceled) return;

    const added: UploadProgressItem[] = result.assets.map((asset, index) => ({
      id: `upload-${Date.now()}-${index}`,
      uri: asset.uri,
      name: asset.fileName ?? `Ảnh ${uploads.length + index + 1}.jpg`,
      size: asset.fileSize,
      progress: 0,
      status: 'uploading',
    }));

    setUploads((current) => [...current, ...added]);

    if (!currentUser) return;

    for (const item of added) {
      try {
        const publicUrl = await uploadProductImage(item.uri, currentUser.id);
        setUploads((current) =>
          current.map((u) => (u.id === item.id ? { ...u, progress: 100, status: 'done', uri: publicUrl } : u))
        );
      } catch {
        setUploads((current) =>
          current.map((u) => (u.id === item.id ? { ...u, status: 'error' } : u))
        );
      }
    }
  }

  function retry(id: string) {
    setUploads((current) =>
      current.map((u) => (u.id === id ? { ...u, status: 'uploading', progress: 0 } : u))
    );
    const item = uploads.find((u) => u.id === id);
    if (!item || !currentUser) return;

    uploadProductImage(item.uri, currentUser.id)
      .then((publicUrl) => {
        setUploads((current) =>
          current.map((u) => (u.id === id ? { ...u, progress: 100, status: 'done', uri: publicUrl } : u))
        );
      })
      .catch(() => {
        setUploads((current) =>
          current.map((u) => (u.id === id ? { ...u, status: 'error' } : u))
        );
      });
  }

  function removeUpload(id: string) {
    setUploads((current) => current.filter((u) => u.id !== id));
  }

  async function handleSubmit() {
    const parsedPrice = Number(price.replace(/\D/g, ''));
    const parsedStock = Number(stock);

    if (title.trim().length < 5) {
      Alert.alert('Thiếu tên sản phẩm', 'Tên sản phẩm cần có ít nhất 5 ký tự.');
      return;
    }
    if (description.trim().length < 20) {
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
    const doneUris = uploads.filter((u) => u.status === 'done').map((u) => u.uri);
    if (doneUris.length === 0) {
      Alert.alert('Chưa có ảnh', 'Vui lòng thêm ít nhất một ảnh sản phẩm.');
      return;
    }
    if (!allowsMeetup && !allowsCod) {
      Alert.alert('Chưa chọn phương thức', 'Vui lòng chọn ít nhất một phương thức nhận hàng.');
      return;
    }

    const input: ProductInput = {
      title: title.trim(),
      description: description.trim(),
      price: parsedPrice,
      stock: parsedStock,
      category,
      condition,
      image: doneUris[0],
      images: doneUris,
      location,
      meetupPoint: meetupPoint.trim() || undefined,
      allowsMeetup,
      allowsCod,
    };

    setSubmitting(true);
    try {
      if (editing) {
        const ok = await updateProduct(editing.id, input);
        if (ok) {
          const isRepublishAction = isRepublish;
          Alert.alert(
            isRepublishAction ? 'Đăng lại thành công' : 'Đã lưu thay đổi',
            isRepublishAction
              ? 'Sản phẩm đã được đưa về trạng thái đang bán.'
              : 'Thông tin sản phẩm đã được cập nhật.',
            [{ text: 'Xong', onPress: () => router.replace('/products') }]
          );
        } else {
          Alert.alert('Lỗi', 'Không thể cập nhật sản phẩm.');
        }
      } else {
        const product = await addProduct(input);
        if (product) {
          Alert.alert('Đăng tin thành công!', 'Sản phẩm của bạn đang được hiển thị cho người mua.', [
            { text: 'Xem ngay', onPress: () => router.replace('/(tabs)') },
          ]);
        } else {
          Alert.alert('Lỗi', 'Không thể đăng sản phẩm.');
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!currentUser) {
    return (
      <View style={styles.screen}>
        <EmptyState
          icon="storefront"
          title="Vui lòng đăng nhập"
          description="Bạn cần đăng nhập để đăng sản phẩm."
        />
      </View>
    );
  }

  if (isRepublish && !sourceProduct) {
    return (
      <View style={styles.screen}>
        <EmptyState
          icon="error-outline"
          title="Sản phẩm gốc đã bị xoá"
          description="Không thể đăng lại sản phẩm này vì nó không còn tồn tại."
        >
          <Button title="Về quản lý sản phẩm" onPress={() => router.replace('/products')} />
        </EmptyState>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={editing && !isRepublish ? 'Chỉnh sửa sản phẩm' : isRepublish ? 'Đăng lại sản phẩm' : 'Đăng sản phẩm'}
        subtitle={
          isRepublish
            ? 'Khôi phục sản phẩm cũ về trạng thái đang bán. Có thể chỉnh sửa thông tin trước khi lưu.'
            : editing
              ? 'Cập nhật thông tin cho sản phẩm của bạn'
              : 'Điền thông tin chi tiết để thu hút người mua trên UniLoop'
        }
      />

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hình ảnh sản phẩm</Text>
          <Text style={styles.cardSubtitle}>Tải lên tối đa 6 hình ảnh. Hình đầu tiên sẽ là ảnh bìa.</Text>
          <View style={styles.imageGrid}>
            {doneUris.map((uri, index) => (
              <View key={`${uri}-${index}`} style={styles.imageCell}>
                {index === 0 ? (
                  <View style={styles.coverBadge}>
                    <Text style={styles.coverBadgeText}>Ảnh bìa</Text>
                  </View>
                ) : null}
                <TouchableOpacity
                  onPress={() => removeUpload(uploads.find((u) => u.uri === uri)?.id ?? '')}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  style={styles.removeImgBtn}>
                  <MaterialIcons name="close" size={14} color={colors.error} />
                </TouchableOpacity>
                <Image source={{ uri }} style={styles.imageCellImage} contentFit="cover" />
              </View>
            ))}
            {doneUris.length < 6 ? (
              <TouchableOpacity onPress={pickImages} style={styles.addImageCell}>
                <MaterialIcons name="add-photo-alternate" size={26} color={colors.primary} />
                <Text style={styles.addImageText}>Thêm ảnh</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <UploadProgress items={uploads} onRetry={retry} onRemove={removeUpload} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin cơ bản</Text>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Tên sản phẩm <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ví dụ: Giáo trình Kinh tế vi mô"
              placeholderTextColor={colors.outline}
              maxLength={80}
              style={styles.input}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Danh mục</Text>
            <View style={styles.chipWrap}>
              {CATEGORIES.map((item) => (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.85}
                  onPress={() => setCategory(item)}
                  style={[styles.chip, category === item && styles.chipActive]}>
                  <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Tình trạng</Text>
            <View style={styles.conditionRow}>
              {CONDITIONS.map((item) => {
                const selected = condition === item;
                return (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.85}
                    onPress={() => setCondition(item)}
                    style={[styles.conditionCard, selected && styles.conditionCardActive]}>
                    <Text style={[styles.conditionText, selected && styles.conditionTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View style={styles.rowFields}>
            <View style={styles.priceField}>
              <Text style={styles.fieldLabel}>
                Giá bán (VND) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrap}>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0"
                  placeholderTextColor={colors.outline}
                  keyboardType="number-pad"
                  maxLength={12}
                  style={[styles.input, styles.inputWithSuffix]}
                />
                <Text style={styles.inputSuffix}>₫</Text>
              </View>
            </View>
            <View style={styles.stockField}>
              <Text style={styles.fieldLabel}>Số lượng tồn kho</Text>
              <TextInput
                value={stock}
                onChangeText={setStock}
                placeholder="1"
                placeholderTextColor={colors.outline}
                keyboardType="number-pad"
                maxLength={3}
                style={styles.input}
              />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mô tả chi tiết</Text>
          <Text style={styles.cardSubtitle}>
            Cung cấp thông tin rõ ràng về nguồn gốc, tình trạng hiện tại, và lý do bán.
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Tình trạng, phụ kiện đi kèm, thời gian đã sử dụng..."
            placeholderTextColor={colors.outline}
            multiline
            maxLength={500}
            style={[styles.input, styles.textarea]}
          />
          <Text style={styles.counter}>{description.length}/500</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Phương thức giao dịch</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setAllowsMeetup((v) => !v)}
            style={styles.methodOption}>
            <MaterialIcons
              name={allowsMeetup ? 'check-box' : 'check-box-outline-blank'}
              size={22}
              color={allowsMeetup ? colors.primary : colors.outlineVariant}
            />
            <View style={styles.methodTextWrap}>
              <Text style={styles.methodTitle}>Gặp trực tiếp</Text>
              <Text style={styles.methodSub}>Giao dịch tại khuôn viên trường hoặc khu vực lân cận</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setAllowsCod((v) => !v)}
            style={styles.methodOption}>
            <MaterialIcons
              name={allowsCod ? 'check-box' : 'check-box-outline-blank'}
              size={22}
              color={allowsCod ? colors.primary : colors.outlineVariant}
            />
            <View style={styles.methodTextWrap}>
              <Text style={styles.methodTitle}>Giao tận nơi</Text>
              <Text style={styles.methodSub}>Sử dụng đơn vị vận chuyển nội thành</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Địa điểm hẹn giao dịch</Text>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Tên điểm hẹn (Tùy chọn)</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons
                name="location-on"
                size={18}
                color={colors.onSurfaceVariant}
                style={styles.inputIcon}
              />
              <TextInput
                value={meetupPoint}
                onChangeText={setMeetupPoint}
                placeholder="VD: Cổng trường, Thư viện..."
                placeholderTextColor={colors.outline}
                style={[styles.input, styles.inputWithIcon]}
              />
            </View>
          </View>
          <LocationPicker onChange={setLocation} title="Điểm hẹn nhận sản phẩm" value={location} />
        </View>

        <Text style={styles.footnote}>
          Khi đăng, bạn xác nhận thông tin sản phẩm và vị trí hẹn gặp là chính xác.
        </Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {editing ? (
          <Button
            title="Hủy"
            variant="tonal"
            onPress={() => router.back()}
            style={styles.footerBtn}
          />
        ) : null}
        <Button
          title={editing ? 'Lưu thay đổi' : isRepublish ? 'Đăng lại' : 'Đăng sản phẩm'}
          icon="publish"
          loading={submitting}
          onPress={handleSubmit}
          style={styles.footerBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  body: {
    gap: 16,
    padding: 20,
    paddingBottom: 24,
  },
  heading: {
    marginBottom: 8,
  },
  pageTitle: {
    ...typography.displayLgMobile,
    color: colors.onSurface,
  },
  pageSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 12,
    padding: 16,
    ...shadow.level1,
  },
  cardTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  cardSubtitle: {
    ...typography.bodySm,
    color: colors.outline,
    marginTop: -4,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageCell: {
    aspectRatio: 1,
    backgroundColor: colors.surfaceVariant,
    borderColor: 'rgba(195,198,215,0.5)',
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: '30%',
    flexGrow: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  imageCellImage: {
    height: '100%',
    width: '100%',
  },
  coverBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    left: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    position: 'absolute',
    top: 4,
    zIndex: 2,
  },
  coverBadgeText: {
    color: colors.onPrimary,
    fontSize: 10,
    fontWeight: '500',
  },
  removeImgBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(229,238,255,0.8)',
    borderRadius: radius.full,
    height: 22,
    justifyContent: 'center',
    position: 'absolute',
    right: 4,
    top: 4,
    width: 22,
    zIndex: 2,
  },
  addImageCell: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 2,
    flexBasis: '30%',
    flexGrow: 1,
    gap: 4,
    justifyContent: 'center',
  },
  addImageText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  fieldGroup: {
    gap: 7,
  },
  fieldLabel: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.outlineVariant,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.onSurface,
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  inputWrap: {
    position: 'relative',
  },
  inputWithSuffix: {
    paddingRight: 36,
  },
  inputSuffix: {
    ...typography.labelMd,
    color: colors.outline,
    position: 'absolute',
    right: 16,
    top: 13,
  },
  inputWithIcon: {
    paddingLeft: 40,
  },
  inputIcon: {
    left: 14,
    position: 'absolute',
    top: 13,
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  counter: {
    color: colors.outline,
    fontSize: 12,
    marginTop: -4,
    textAlign: 'right',
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  priceField: {
    flex: 1,
  },
  stockField: {
    width: 118,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.outlineVariant,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: 'rgba(0,74,198,0.1)',
    borderColor: 'rgba(0,74,198,0.2)',
  },
  chipText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  conditionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  conditionCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  conditionCardActive: {
    backgroundColor: 'rgba(0,74,198,0.1)',
    borderColor: 'rgba(0,74,198,0.2)',
  },
  conditionText: {
    ...typography.labelMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  conditionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  methodOption: {
    alignItems: 'flex-start',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 10,
    padding: 8,
  },
  methodTextWrap: {
    flex: 1,
    gap: 2,
  },
  methodTitle: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  methodSub: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  footnote: {
    color: colors.outline,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.9)',
    borderTopColor: 'rgba(195,198,215,0.3)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  footerBtn: {
    minWidth: 140,
  },
});
