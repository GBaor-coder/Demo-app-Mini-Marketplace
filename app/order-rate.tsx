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

import { Button, EmptyState, MaterialIcons, ScreenHeader, toIconName } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';

const RATING_LABELS = ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'];
const MAX_IMAGES = 3;

export default function OrderRateScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, currentUser, addReview } = useStore();

  const order = orders.find((o) => o.id === id);
  const item = order?.items[0];
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền thư viện ảnh', 'Vui lòng cấp quyền để thêm ảnh thực tế.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - images.length,
      quality: 0.82,
    });
    if (result.canceled) {
      return;
    }
    setImages((current) =>
      [...current, ...result.assets.map((asset) => asset.uri)].slice(0, MAX_IMAGES)
    );
  };

  const submit = () => {
    if (rating === 0) {
      Alert.alert('Chưa chọn sao', 'Vui lòng chọn số sao cho sản phẩm.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      order?.items.forEach((it) => {
        addReview({
          orderId: order.id,
          authorId: currentUser?.id ?? '',
          productId: it.productId,
          rating,
          content: comment.trim(),
          images,
        });
      });
      setSubmitting(false);
      Alert.alert('Cảm ơn bạn!', 'Đánh giá của bạn đã được gửi. Điều này giúp ích rất nhiều cho cộng đồng.', [
        { text: 'Đóng', onPress: () => router.back() },
      ]);
    }, 600);
  };

  if (!order || !item) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Đánh giá sản phẩm" />
        <EmptyState icon={toIconName('receipt_outline')} title="Không tìm thấy đơn hàng" description="Đơn hàng này có thể đã bị xóa." />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Đánh giá sản phẩm" />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {item ? (
          <View style={styles.productCard}>
            {item.image ? (
              <Image source={{ uri: item.image }} contentFit="cover" style={styles.productThumb} />
            ) : (
              <View style={[styles.productThumb, styles.productThumbFallback]}>
                <Text style={styles.productFallback}>{item.title.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.productMeta}>
                Phân loại: {item.variant ?? item.condition ?? ''}
              </Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Chất lượng sản phẩm</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => setRating(value)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <MaterialIcons
                name={value <= rating ? 'star' : 'star-outline'}
                size={40}
                color={value <= rating ? colors.primaryContainer : colors.outlineVariant}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingLabel}>
          {rating === 0 ? 'Chạm để chọn số sao' : RATING_LABELS[rating - 1]}
        </Text>

        <Text style={styles.sectionTitle}>Trải nghiệm của bạn</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm, quá trình giao hàng..."
          placeholderTextColor={colors.outline}
          multiline
          style={styles.commentInput}
        />
        <Text style={styles.commentCount}>{comment.length}/500</Text>

        <Text style={styles.sectionTitle}>
          Thêm hình ảnh thực tế <Text style={styles.uploadSub}>(Tối đa 3 ảnh)</Text>
        </Text>
        <View style={styles.uploadRow}>
          {images.length < MAX_IMAGES ? (
            <TouchableOpacity activeOpacity={0.8} onPress={pickImages} style={styles.uploadBtn}>
              <MaterialIcons name="add-a-photo" size={28} color={colors.onSurfaceVariant} />
              <Text style={styles.uploadLabel}>Thêm ảnh</Text>
            </TouchableOpacity>
          ) : null}
          {images.map((uri, index) => (
            <View key={index} style={styles.uploadedWrap}>
              <Image source={{ uri }} contentFit="cover" style={styles.uploadedImg} />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setImages((current) => current.filter((_, i) => i !== index))}
                style={styles.removeBtn}>
                <MaterialIcons name="close" size={16} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Gửi đánh giá" size="lg" loading={submitting} fullWidth onPress={submit} />
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
    gap: 8,
    padding: 20,
  },
  pageTitle: {
    ...typography.displayLgMobile,
    color: colors.onSurface,
    marginBottom: 16,
  },
  productCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.2)',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    padding: 16,
    ...shadow.level1,
  },
  productThumb: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    height: 80,
    width: 80,
  },
  productThumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productFallback: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '700',
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productTitle: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: '600',
  },
  productMeta: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    ...typography.button,
    color: colors.onSurface,
    marginBottom: 8,
    marginTop: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  commentInput: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: colors.onSurface,
    fontSize: 15,
    minHeight: 120,
    padding: 14,
    textAlignVertical: 'top',
  },
  commentCount: {
    color: colors.outline,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
  },
  uploadSub: {
    color: colors.outline,
    fontSize: 14,
    fontWeight: '400',
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadBtn: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  uploadLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 4,
  },
  uploadedWrap: {
    borderRadius: radius.md,
    height: 96,
    overflow: 'hidden',
    position: 'relative',
    width: 96,
  },
  uploadedImg: {
    height: '100%',
    width: '100%',
  },
  removeBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.8)',
    borderRadius: radius.full,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 6,
    top: 6,
    width: 24,
  },
  footer: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopWidth: 1,
    padding: 20,
  },
});
