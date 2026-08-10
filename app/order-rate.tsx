import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

import { Button } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';

const RATING_LABELS = ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'];

export default function OrderRateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, currentUser, addReview } = useStore();

  const order = orders.find((o) => o.id === id);
  const item = order?.items[0];
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
          images: [],
        });
      });
      setSubmitting(false);
      Alert.alert('Cảm ơn bạn!', 'Đánh giá của bạn đã được gửi. Điều này giúp ích rất nhiều cho cộng đồng.', [
        { text: 'Đóng', onPress: () => router.back() },
      ]);
    }, 600);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Đánh giá đơn hàng</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Đánh giá sản phẩm</Text>

        {item ? (
          <View style={styles.productCard}>
            <View style={styles.productThumb}>
              <Text style={styles.productFallback}>{item.title.charAt(0)}</Text>
            </View>
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
              <Ionicons
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
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
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
  header: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.94)',
    flexDirection: 'row',
    paddingBottom: 10,
    paddingHorizontal: 12,
    ...shadow.level1,
  },
  headerBtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 36,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
    flex: 1,
    textAlign: 'center',
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
    borderRadius: radius['2xl'],
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    padding: 16,
    ...shadow.level1,
  },
  productThumb: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    height: 80,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 80,
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
    borderRadius: radius.xl,
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
  footer: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopWidth: 1,
    padding: 20,
  },
});
