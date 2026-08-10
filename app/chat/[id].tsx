import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/Avatar';
import { EmptyState } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { ChatMessage } from '@/src/types';
import { formatClock, formatDateTime } from '@/src/utils/format';

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { chats, products, currentUser, getUserById, sendMessage } = useStore();

  const [text, setText] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const thread = useMemo(() => chats.find((c) => c.id === id), [chats, id]);

  const first = thread?.messages[0];
  const divider = useMemo(() => {
    if (!first) return '';
    const date = new Date(first.createdAt);
    const isToday = date.toDateString() === new Date().toDateString();
    return isToday ? `Hôm nay, ${formatClock(first.createdAt)}` : formatDateTime(first.createdAt);
  }, [first]);

  useEffect(() => {
    const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 120);
    return () => clearTimeout(timer);
  }, [thread?.messages.length]);

  if (!thread) {
    return (
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.peerName}>Trò chuyện</Text>
          <View style={styles.headerBtn} />
        </View>
        <EmptyState icon="chatbubble-outline" title="Không tìm thấy hội thoại" />
      </View>
    );
  }

  const otherId = thread.participants.find((p) => p !== currentUser?.id) ?? thread.participants[0];
  const other = getUserById(otherId);
  const product = products.find((p) => p.id === thread.productId);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(thread.id, trimmed);
    setText('');
  };

  const offerLocation = () => {
    sendMessage(thread.id, 'Gửi vị trí hẹn gặp cho bạn nhé.', {
      latitude: 10.762622,
      longitude: 106.660172,
      address: 'Cổng D5, Đại học Bách Khoa TP.HCM, 268 Lý Thường Kiệt',
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const mine = item.senderId === currentUser?.id;
    return (
      <View style={[styles.messageRow, mine ? styles.messageRowMine : styles.messageRowOther]}>
        {!mine ? (
          <Avatar uri={other?.avatar} name={other?.name ?? '?'} size={28} />
        ) : null}
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
          {item.offerLocation ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/map')}
              style={styles.offerCard}>
              <View style={styles.offerRow}>
                <Ionicons name="location" size={20} color={colors.primary} />
                <Text style={styles.offerAddress} numberOfLines={2}>
                  {item.offerLocation.address}
                </Text>
              </View>
              <View style={styles.offerDivider} />
              <View style={styles.offerRow}>
                <Ionicons name="time" size={20} color={colors.primary} />
                <Text style={styles.offerTime}>Hôm nay, {formatClock(item.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          ) : null}
          <Text style={[styles.messageText, mine && styles.messageTextMine]}>{item.text}</Text>
          <View style={styles.messageMeta}>
            <Text style={styles.messageTime}>{formatClock(item.createdAt)}</Text>
            {mine ? <Ionicons name="checkmark-done" size={14} color={colors.primary} /> : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatarRing}>
            <Avatar uri={other?.avatar} name={other?.name ?? '?'} size={40} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.peerName} numberOfLines={1}>
              {other?.name ?? 'Người dùng'}
            </Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Đang hoạt động</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={thread.messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {first ? (
              <View style={styles.dividerWrap}>
                <Text style={styles.dividerText}>{divider}</Text>
              </View>
            ) : null}
            {product ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push(`/product/${product.id}`)}
                style={styles.productCard}>
                <Image
                  source={{ uri: product.images?.[0] || product.image }}
                  style={styles.productThumb}
                />
                <View style={styles.productInfo}>
                  <Text numberOfLines={2} style={styles.productTitle}>
                    {product.title}
                  </Text>
                  <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.outlineVariant} />
              </TouchableOpacity>
            ) : null}
          </>
        }
        renderItem={renderMessage}
      />

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity onPress={offerLocation} style={styles.inputIconBtn}>
          <Ionicons name="location-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={colors.outline}
          style={styles.input}
          multiline
        />
        <TouchableOpacity
          onPress={send}
          disabled={!text.trim()}
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}>
          <Ionicons name="send" size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function formatPrice(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.85)',
    borderBottomColor: 'rgba(195,198,215,0.2)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingBottom: 10,
    paddingHorizontal: 20,
    ...shadow.level1,
  },
  headerBtn: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerInfo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  avatarRing: {
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.full,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerText: {
    flex: 1,
    gap: 1,
  },
  peerName: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontWeight: '700',
  },
  onlineRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  onlineDot: {
    backgroundColor: colors.tertiaryFixedDim,
    borderRadius: radius.full,
    height: 8,
    width: 8,
  },
  onlineText: {
    ...typography.bodySm,
    color: colors.outline,
    fontSize: 12,
  },
  list: {
    gap: 16,
    padding: 20,
    paddingBottom: 24,
  },
  dividerWrap: {
    alignItems: 'center',
  },
  dividerText: {
    ...typography.labelMd,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    color: colors.outline,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  productCard: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    maxWidth: '100%',
    padding: 12,
    width: '92%',
    ...shadow.level1,
  },
  productThumb: {
    borderRadius: radius.lg,
    height: 64,
    width: 64,
  },
  productInfo: {
    flex: 1,
    gap: 2,
  },
  productTitle: {
    ...typography.labelMd,
    color: colors.onSurface,
    lineHeight: 18,
  },
  productPrice: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  messageRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius['2xl'],
    borderTopLeftRadius: 4,
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...shadow.level1,
  },
  bubbleMine: {
    backgroundColor: colors.primaryContainer,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: 4,
  },
  bubbleOther: {
    borderTopLeftRadius: 4,
  },
  messageText: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  messageTextMine: {
    color: colors.onPrimaryContainer,
  },
  messageMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  messageTime: {
    color: colors.outline,
    fontSize: 11,
  },
  offerCard: {
    backgroundColor: colors.surfaceBright,
    borderColor: 'rgba(0,74,198,0.2)',
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 8,
    marginBottom: 8,
    padding: 12,
  },
  offerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  offerAddress: {
    ...typography.labelMd,
    color: colors.onSurface,
    flex: 1,
    lineHeight: 18,
  },
  offerDivider: {
    backgroundColor: 'rgba(195,198,215,0.3)',
    height: 1,
    marginVertical: 2,
    width: '100%',
  },
  offerTime: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  inputBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  inputIconBtn: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  input: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.outlineVariant,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    color: colors.onSurface,
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    maxHeight: 96,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 44,
    justifyContent: 'center',
    width: 44,
    ...shadow.level1,
  },
  sendBtnDisabled: {
    backgroundColor: colors.surfaceContainerHigh,
  },
});
