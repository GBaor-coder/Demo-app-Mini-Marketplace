import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Avatar } from '@/src/components/Avatar';
import { Chip, EmptyState, MaterialIcons, ScreenHeader } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { ChatThread } from '@/src/types';
import { formatRelativeTime } from '@/src/utils/format';

type Filter = 'all' | 'unread' | 'answered';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'unread', label: 'Chưa đọc' },
  { key: 'answered', label: 'Đã trả lời' },
];

export default function SellerChatsScreen() {
  const router = useRouter();
  const { chats, currentUser, getUserById, products } = useStore();
  const [filter, setFilter] = useState<Filter>('all');

  const myChats = useMemo(
    () =>
      chats
        .filter((thread) => thread.participants.includes(currentUser?.id ?? ''))
        .sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    [chats, currentUser?.id]
  );

  const list = useMemo(() => {
    const me = currentUser?.id;
    return myChats.filter((thread) => {
      if (filter === 'unread') {
        return thread.messages.some((m) => m.senderId !== me && !m.read);
      }
      if (filter === 'answered') {
        const last = thread.messages[thread.messages.length - 1];
        return Boolean(last && last.senderId === me);
      }
      return true;
    });
  }, [myChats, filter, currentUser?.id]);

  const renderItem = ({ item }: { item: ChatThread }) => {
    const otherId =
      item.participants.find((p) => p !== currentUser?.id) ?? item.participants[0];
    const other = getUserById(otherId);
    const product = products.find((p) => p.id === item.productId);
    const lastMessage = item.messages[item.messages.length - 1];
    const unread = item.messages.filter(
      (m) => m.senderId !== currentUser?.id && !m.read
    ).length;
    const answered = Boolean(lastMessage && lastMessage.senderId === currentUser?.id);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/chat/${item.id}`)}
        style={styles.chatRow}>
        <View style={styles.avatarWrap}>
          <Avatar uri={other?.avatar} name={other?.name ?? '?'} size={56} />
          <View style={[styles.onlineDot, unread > 0 ? styles.online : styles.offline]} />
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatTop}>
            <Text numberOfLines={1} style={[styles.peerName, unread > 0 && styles.peerNameUnread]}>
              {other?.name ?? 'Người dùng'}
            </Text>
            <Text style={[styles.time, unread > 0 && styles.timeUnread]}>
              {formatRelativeTime(item.updatedAt)}
            </Text>
          </View>
          {product ? (
            <View style={styles.productRow}>
              <MaterialIcons name="sell" size={16} color={colors.outline} />
              <Text numberOfLines={1} style={styles.productName}>
                {product.title}
              </Text>
            </View>
          ) : null}
          <Text
            numberOfLines={1}
            style={[styles.preview, unread > 0 && styles.previewUnread]}>
            {lastMessage?.text ?? 'Bắt đầu cuộc trò chuyện'}
          </Text>
        </View>
        <View style={styles.chatRight}>
          {unread > 0 ? (
            <View style={styles.unreadDot} />
          ) : answered ? (
            <MaterialIcons name="done-all" size={18} color={colors.primary} />
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Trò chuyện" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}>
        {FILTERS.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            selected={filter === item.key}
            onPress={() => setFilter(item.key)}
          />
        ))}
      </ScrollView>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="chat-bubble-outline"
            title="Chưa có cuộc trò chuyện nào"
            description="Khi người mua nhắn tin với bạn, các cuộc trò chuyện sẽ xuất hiện tại đây."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  tabsContent: {
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  list: {
    gap: 12,
    padding: 20,
  },
  chatRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    ...shadow.level1,
  },
  avatarWrap: {
    position: 'relative',
  },
  onlineDot: {
    borderRadius: radius.full,
    borderColor: colors.surfaceContainerLowest,
    borderWidth: 2,
    bottom: 0,
    height: 14,
    position: 'absolute',
    right: 0,
    width: 14,
  },
  online: {
    backgroundColor: colors.tertiaryFixedDim,
  },
  offline: {
    backgroundColor: colors.outline,
  },
  chatInfo: {
    flex: 1,
    gap: 2,
  },
  chatTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  peerName: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
    fontWeight: '600',
    marginRight: 8,
  },
  peerNameUnread: {
    color: colors.primary,
  },
  time: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
  timeUnread: {
    color: colors.primary,
  },
  productRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  productName: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  preview: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  previewUnread: {
    color: colors.onSurface,
    fontWeight: '600',
  },
  chatRight: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
  },
  unreadDot: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
    height: 10,
    width: 10,
  },
});
