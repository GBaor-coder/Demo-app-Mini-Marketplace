import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/Avatar';
import { EmptyState, MaterialIcons } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { uploadChatImage } from '@/src/lib/image-upload';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { ChatMessage } from '@/src/types';
import { formatClock, formatDateTime } from '@/src/utils/format';
import { openMapLink } from '@/src/utils/maps';

const EMOJIS = [
  '😀',
  '😂',
  '😍',
  '🥰',
  '😎',
  '🤔',
  '😅',
  '😢',
  '😡',
  '😘',
  '🤗',
  '😴',
  '👍',
  '🙏',
  '👏',
  '💪',
  '🔥',
  '❤️',
  '💖',
  '✨',
  '🎉',
  '🎁',
  '🤝',
  '✅',
  '🙌',
];

const GROUP_GAP_MS = 5 * 60 * 1000;

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    chats,
    products,
    currentUser,
    getUserById,
    sendMessage,
    markThreadRead,
  } = useStore();
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const markingRef = useRef(false);

  const thread = useMemo(() => chats.find((c) => c.id === id), [chats, id]);

  const messages = thread?.messages ?? [];

  const first = messages[0];
  const divider = useMemo(() => {
    if (!first) return '';
    const date = new Date(first.createdAt);
    const isToday = date.toDateString() === new Date().toDateString();
    return isToday ? `Hôm nay, ${formatClock(first.createdAt)}` : formatDateTime(first.createdAt);
  }, [first]);

  useEffect(() => {
    const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 120);
    return () => clearTimeout(timer);
  }, [messages.length]);

  useEffect(() => {
    if (!thread || !currentUser || markingRef.current) return;
    const hasUnread = thread.messages.some(
      (m) => m.senderId !== currentUser.id && !m.read
    );
    if (!hasUnread) return;
    markingRef.current = true;
    void markThreadRead(thread.id).finally(() => {
      markingRef.current = false;
    });
  }, [thread, markThreadRead, currentUser]);

  if (!thread) {
    return (
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <MaterialIcons name="arrow-back" size={22} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={styles.peerName}>Trò chuyện</Text>
          <View style={styles.headerBtn} />
        </View>
        <EmptyState icon="chat-bubble-outline" title="Không tìm thấy hội thoại" />
      </View>
    );
  }

  const otherId =
    thread.participants.find((p) => p !== currentUser?.id) ?? thread.participants[0];
  const other = getUserById(otherId);
  const product = products.find((p) => p?.id === thread.productId);

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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: false,
    });
    if (result.canceled || !result.assets?.[0]?.uri || !currentUser) return;

    setSending(true);
    try {
      const url = await uploadChatImage(result.assets[0].uri, currentUser.id);
      await sendMessage(thread.id, '', undefined, url);
    } catch (err) {
      Alert.alert(
        'Không gửi được ảnh',
        err instanceof Error ? err.message : 'Không thể tải ảnh lên.',
        [{ text: 'OK' }]
      );
    } finally {
      setSending(false);
    }
  };

  const handleEmoji = (emoji: string) => {
    setText((current) => current + emoji);
  };

  const openMoreMenu = () => {
    const actions: { text: string; onPress: () => void }[] = [];
    if (product) {
      actions.push({
        text: 'Xem sản phẩm',
        onPress: () => router.push(`/product/${product.id}`),
      });
    }
    if (!product) {
      actions.push({
        text: 'Xem cửa hàng',
        onPress: () => router.push(`/store?userId=${otherId}`),
      });
    }
    actions.push({
      text: 'Báo cáo vi phạm',
      onPress: () => router.push(`/report?thread=${thread.id}`),
    });

    Alert.alert('Tùy chọn', undefined, [
      ...actions.map((a) => ({ text: a.text, onPress: a.onPress })),
      { text: 'Đóng', style: 'cancel' },
    ]);
  };

  const isLastOfGroup = (index: number) => {
    const m = messages[index];
    const next = messages[index + 1];
    if (!next) return true;
    if (next.senderId !== m.senderId) return true;
    return (
      new Date(next.createdAt).getTime() - new Date(m.createdAt).getTime() > GROUP_GAP_MS
    );
  };

  const showPeerAvatar = (index: number) => {
    const m = messages[index];
    const prev = messages[index - 1];
    if (m.senderId === currentUser?.id) return false;
    if (!prev || prev.senderId !== m.senderId) return true;
    return (
      new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() > GROUP_GAP_MS
    );
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const mine = item.senderId === currentUser?.id;
    const lastOfGroup = isLastOfGroup(index);
    const showAvatar = showPeerAvatar(index);

    return (
      <View style={[styles.messageRow, mine ? styles.messageRowMine : styles.messageRowOther]}>
        {!mine ? (
          <View style={[styles.avatarSlot, lastOfGroup && styles.avatarSlotVisible]}>
            {lastOfGroup || showAvatar ? (
              <Avatar uri={other?.avatar} name={other?.name ?? '?'} size={30} />
            ) : null}
          </View>
        ) : null}

        <View
          style={[
            styles.bubble,
            mine ? styles.bubbleMine : styles.bubbleOther,
            lastOfGroup && mine && styles.bubbleMineTail,
            lastOfGroup && !mine && styles.bubbleOtherTail,
          ]}>
          {item.offerLocation ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                void openMapLink(
                  item.offerLocation!.latitude,
                  item.offerLocation!.longitude
                );
              }}
              style={styles.offerCard}>
              <View style={styles.offerRow}>
                <MaterialIcons name="place" size={20} color={colors.primary} />
                <Text style={styles.offerAddress} numberOfLines={2}>
                  {item.offerLocation.address}
                </Text>
              </View>
              <View style={styles.offerRow}>
                <MaterialIcons name="schedule" size={20} color={colors.primary} />
                <Text style={styles.offerTime}>Hôm nay, {formatClock(item.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          ) : null}

          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={[styles.messageImage, mine && styles.messageImageMine]}
              contentFit="cover"
              transition={150}
            />
          ) : null}

          {item.text ? (
            <Text style={[styles.messageText, mine && styles.messageTextMine]}>
              {item.text}
            </Text>
          ) : null}

          {lastOfGroup ? (
            <View style={styles.messageMeta}>
              <Text style={[styles.messageTime, mine && styles.messageTimeMine]}>
                {formatClock(item.createdAt)}
              </Text>
              {mine ? (
                <MaterialIcons
                  name={item.read ? 'done-all' : 'done'}
                  size={14}
                  color={
                    item.read
                      ? colors.onPrimaryContainer
                      : 'rgba(238,239,255,0.55)'
                  }
                />
              ) : null}
            </View>
          ) : null}
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
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => (product ? router.push(`/product/${product.id}`) : router.push(`/store?userId=${otherId}`))}
          style={styles.headerInfo}>
          <View style={styles.avatarRing}>
            <Avatar uri={other?.avatar} name={other?.name ?? '?'} size={40} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.peerName} numberOfLines={1}>
              {other?.name ?? 'Người dùng'}
            </Text>
            <Text style={styles.peerMeta} numberOfLines={1}>
              {product ? product.title : other?.campus ?? 'Hội thoại'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={openMoreMenu} style={styles.headerBtn}>
          <MaterialIcons name="more-vert" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
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
                  <Text numberOfLines={1} style={styles.productTitle}>
                    {product.title}
                  </Text>
                  <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                </View>
                <View style={styles.productBtn}>
                  <Text style={styles.productBtnText}>Xem</Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </>
        }
        renderItem={renderMessage}
        ListEmptyComponent={
          <View style={styles.startHint}>
            <View style={styles.startIcon}>
              <MaterialIcons name="handshake" size={32} color={colors.primary} />
            </View>
            <Text style={styles.startTitle}>Bạn và {other?.name ?? 'người này'} đã kết nối</Text>
            <Text style={styles.startBody}>
              Hãy nhắn tin để thương lượng giá, chốt điểm hẹn hoặc trao đổi thông tin giao dịch.
            </Text>
          </View>
        }
      />

      {showEmoji ? (
        <View style={styles.emojiPanel}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.emojiContent}>
            {EMOJIS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => handleEmoji(emoji)}
                style={styles.emojiItem}>
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity onPress={() => setShowEmoji((v) => !v)} style={styles.inputIconBtn}>
          <MaterialIcons
            name={showEmoji ? 'keyboard' : 'emoji-emotions'}
            size={24}
            color={showEmoji ? colors.primary : colors.onSurfaceVariant}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={pickImage} style={styles.inputIconBtn}>
          <MaterialIcons
            name={sending ? 'hourglass-empty' : 'image'}
            size={24}
            color={colors.onSurfaceVariant}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={offerLocation} style={styles.inputIconBtn}>
          <MaterialIcons name="location-on" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Nhắn tin..."
            placeholderTextColor={colors.outlineVariant}
            style={styles.input}
            multiline
          />
          <TouchableOpacity
            onPress={send}
            disabled={!text.trim()}
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}>
            <MaterialIcons name="send" size={20} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 16,
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
    borderColor: colors.surfaceContainerHigh,
    borderRadius: radius.full,
    borderWidth: 2,
    overflow: 'hidden',
  },
  headerText: {
    flex: 1,
    gap: 1,
  },
  peerName: {
    ...typography.headlineSmMobile,
    color: colors.onSurface,
  },
  peerMeta: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
  list: {
    gap: 10,
    padding: 16,
    paddingBottom: 24,
  },
  dividerWrap: {
    alignItems: 'center',
    marginBottom: 4,
  },
  dividerText: {
    ...typography.bodySm,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    color: colors.onSurfaceVariant,
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  productCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.2)',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    padding: 12,
    ...shadow.level1,
  },
  productThumb: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.md,
    height: 56,
    width: 56,
  },
  productInfo: {
    flex: 1,
    gap: 2,
  },
  productTitle: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  productPrice: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '600',
  },
  productBtn: {
    backgroundColor: 'rgba(33,112,228,0.1)',
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  productBtnText: {
    ...typography.labelMd,
    color: colors.secondaryContainer,
  },
  startHint: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  startIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderRadius: radius.full,
    height: 72,
    justifyContent: 'center',
    marginBottom: 4,
    width: 72,
  },
  startTitle: {
    ...typography.headlineSmMobile,
    color: colors.onSurface,
    textAlign: 'center',
  },
  startBody: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    maxWidth: 280,
    textAlign: 'center',
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
  avatarSlot: {
    width: 30,
  },
  avatarSlotVisible: {
    justifyContent: 'flex-end',
  },
  bubble: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.1)',
    borderRadius: radius.lg,
    borderWidth: 1,
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...shadow.level1,
  },
  bubbleMine: {
    backgroundColor: colors.primaryContainer,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  bubbleMineTail: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  bubbleOtherTail: {
    borderBottomLeftRadius: 4,
  },
  messageImage: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.md,
    height: 220,
    marginBottom: 4,
    width: 240,
  },
  messageImageMine: {
    backgroundColor: colors.primaryFixed,
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
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
  messageTimeMine: {
    color: 'rgba(238,239,255,0.7)',
  },
  offerCard: {
    backgroundColor: colors.surfaceBright,
    borderColor: 'rgba(0,74,198,0.2)',
    borderRadius: radius.md,
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
  offerTime: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  emojiPanel: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopWidth: 1,
  },
  emojiContent: {
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emojiItem: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  emojiText: {
    fontSize: 22,
  },
  inputBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,255,0.9)',
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  inputIconBtn: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  inputWrap: {
    flex: 1,
    position: 'relative',
  },
  input: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: radius.full,
    borderWidth: 1,
    color: colors.onSurface,
    fontSize: 16,
    lineHeight: 24,
    maxHeight: 96,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingRight: 52,
    paddingVertical: 10,
  },
  sendBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 4,
    top: 4,
    width: 40,
    ...shadow.level1,
  },
  sendBtnDisabled: {
    backgroundColor: colors.surfaceContainerHigh,
  },
});