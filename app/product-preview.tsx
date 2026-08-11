import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/Avatar';
import { Button, EmptyState, MaterialIcons, ScreenHeader } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { formatCurrencyFull, formatRelativeTime } from '@/src/utils/format';

export default function ProductPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, currentUser, getUserById, deleteProduct, markProductSold } = useStore();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const product = products.find((p) => p.id === id);
  const seller = product ? getUserById(product.sellerId) : undefined;

  if (!product || product.sellerId !== currentUser?.id) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Xem trước bài đăng" />
        <EmptyState icon="error-outline" title="Không tìm thấy sản phẩm" />
      </View>
    );
  }

  const image = product.images?.[0] || product.image;
  const imageCount = Math.max(1, product.images?.length ?? 0);
  const isSold = product.status === 'sold';
  const isSelf = seller?.id === currentUser?.id;

  const confirmDelete = () => {
    setBusy(true);
    setTimeout(() => {
      deleteProduct(product.id);
      setBusy(false);
      setDeleteOpen(false);
      router.back();
    }, 400);
  };

  const confirmSold = () => {
    setBusy(true);
    setTimeout(() => {
      markProductSold(product.id);
      setBusy(false);
      Alert.alert('Đã đánh dấu bán', 'Sản phẩm sẽ không còn hiển thị cho người mua.');
    }, 400);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Xem trước bài đăng" />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: image }} style={styles.image} contentFit="cover" />
          <View style={styles.counter}>
            <Text style={styles.counterText}>1 / {imageCount}</Text>
          </View>
          <View style={styles.dots}>
            {Array.from({ length: imageCount }).map((_, i) => (
              <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
            ))}
          </View>
          {isSold ? (
            <View style={styles.soldOverlay}>
              <Text style={styles.soldText}>ĐÃ BÁN</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          <View style={styles.chipRow}>
            <View style={styles.conditionChip}>
              <Text style={styles.conditionChipText}>{product.condition}</Text>
            </View>
            <Text style={styles.postedTime}>Đăng {formatRelativeTime(product.createdAt)}</Text>
          </View>

          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.price}>{formatCurrencyFull(product.price)}</Text>

          <View style={styles.card}>
            <Text style={styles.cardHeading}>Mô tả chi tiết</Text>
            <Text style={styles.cardBody}>{product.description}</Text>
          </View>

          {seller ? (
            <View style={[styles.card, styles.sellerCard]}>
              <Text style={styles.cardLabel}>Thông tin người bán</Text>
              <View style={styles.sellerRow}>
                <Avatar uri={seller.avatar} name={seller.name} size={64} />
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>
                    {seller.name}
                    {isSelf ? ' (Bạn)' : ''}
                  </Text>
                  <View style={styles.sellerMetaRow}>
                    <MaterialIcons name="school" size={16} color={colors.onSurfaceVariant} />
                    <Text style={styles.sellerMeta}>{seller.campus}</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : null}

          <View style={styles.card}>
            <View style={styles.mapHeading}>
              <MaterialIcons name="location-on" size={20} color={colors.primary} />
              <Text style={styles.cardHeading}>Khu vực giao dịch</Text>
            </View>
            <Text style={styles.mapAddress}>
              {product.location?.address ?? '---'}
              {product.meetupPoint ? ` · ${product.meetupPoint}` : ''}
            </Text>
            <View style={styles.mapBox}>
              <View style={styles.mapPin}>
                <MaterialIcons name="location-on" size={24} color={colors.primary} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {product.status === 'active' ? (
          <Button
            title="Đánh dấu đã bán"
            variant="outline"
            icon="check-circle"
            onPress={() =>
              Alert.alert('Đánh dấu đã bán?', 'Sản phẩm sẽ ngừng hiển thị với người mua.', [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xác nhận', onPress: confirmSold },
              ])
            }
            style={[styles.footerBtn, { flex: 1 }]}
          />
        ) : null}
        <Button
          title="Xóa"
          variant="outline"
          danger
          icon="delete"
          onPress={() => setDeleteOpen(true)}
          style={[styles.footerBtn, { flex: 1 }]}
        />
        <Button
          title="Sửa tin"
          icon="edit"
          onPress={() => router.push(`/product-form?id=${product.id}`)}
          style={[styles.footerBtn, { flex: product.status === 'active' ? 1.4 : 2 }]}
        />
      </View>

      <Modal visible={deleteOpen} transparent animationType="fade" onRequestClose={() => setDeleteOpen(false)}>
        <View style={styles.modalRoot}>
          <TouchableOpacity style={styles.scrim} activeOpacity={1} onPress={() => setDeleteOpen(false)} />
          <View style={[styles.dialog, { marginBottom: insets.bottom + 24 }]}>
            <View style={styles.dialogIcon}>
              <MaterialIcons name="delete" size={28} color={colors.error} />
            </View>
            <Text style={styles.dialogTitle}>Xóa sản phẩm này?</Text>
            <Text style={styles.dialogText}>
              Sản phẩm “{product.title}” sẽ bị xóa vĩnh viễn và không thể khôi phục. Hành động này không thể hoàn tác.
            </Text>
            <View style={styles.dialogActions}>
              <Button title="Hủy" variant="outline" onPress={() => setDeleteOpen(false)} style={styles.dialogBtn} />
              <Button title="Xóa" variant="danger" loading={busy} onPress={confirmDelete} style={styles.dialogBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  body: {
    paddingBottom: 130,
  },
  imageWrap: {
    backgroundColor: colors.surfaceContainerHighest,
    height: 400,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  counter: {
    backgroundColor: 'rgba(248,249,255,0.85)',
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    position: 'absolute',
    right: 12,
    top: 12,
    ...shadow.level1,
  },
  counterText: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  dots: {
    bottom: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: radius.full,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: colors.onPrimary,
  },
  soldOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(11,28,48,0.55)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  soldText: {
    color: colors.surface,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
  content: {
    padding: 20,
  },
  chipRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  conditionChip: {
    backgroundColor: colors.surfaceContainerHigh,
    borderColor: 'rgba(0,74,198,0.2)',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  conditionChipText: {
    ...typography.labelMd,
    color: colors.primary,
  },
  postedTime: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  productTitle: {
    ...typography.displayLgMobile,
    color: colors.onSurface,
    marginTop: 14,
  },
  price: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginTop: 20,
    padding: 16,
    ...shadow.level1,
  },
  cardHeading: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  cardBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
    marginTop: 10,
  },
  cardLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.6,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  sellerCard: {
    borderColor: 'rgba(0,74,198,0.1)',
    borderWidth: 1,
  },
  sellerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  sellerInfo: {
    flex: 1,
    gap: 4,
  },
  sellerName: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontSize: 18,
    lineHeight: 24,
  },
  sellerMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  sellerMeta: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
  mapHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  mapAddress: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  mapBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHighest,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: 8,
    borderWidth: 1,
    height: 200,
    justifyContent: 'center',
    marginTop: 12,
    overflow: 'hidden',
  },
  mapPin: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.2)',
    borderColor: 'rgba(0,74,198,0.5)',
    borderRadius: radius.full,
    borderWidth: 2,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  footer: {
    backgroundColor: 'rgba(248,249,255,0.92)',
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    ...shadow.level3,
  },
  footerBtn: {
    flex: 1,
  },
  modalRoot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(33,49,69,0.45)',
  },
  dialog: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius['2xl'],
    marginHorizontal: 40,
    padding: 24,
    ...shadow.level3,
  },
  dialogIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.errorContainer,
    borderRadius: radius.full,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  dialogTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontSize: 19,
    marginTop: 16,
    textAlign: 'center',
  },
  dialogText: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  dialogBtn: {
    flex: 1,
  },
});
