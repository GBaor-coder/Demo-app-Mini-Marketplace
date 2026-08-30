import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Avatar } from '@/src/components/Avatar';
import { Chip, EmptyState, IconButton, MaterialIcons, ScreenHeader } from '@/src/components/ui';
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

function messagePreview(message: ChatThread['messages'][number]) {
  if (message.imageUrl && !message.text) return '🖼️ [Ảnh]';
  if (message.offerLocation) return `📍 ${message.offerLocation.address}`;
  return message.text || '[Ảnh]';
}

export default function ChatsScreen() {
  const router = useRouter();
  const { chats, currentUser, getUserById, products, refreshChats } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshChats();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: ChatThread }) => {
    const otherId =
      item.participants.find((p) => p !== currentUser?.id) ?? item.participants[0];
    const other = getUserById(otherId);
    const product = products.find((p) => p?.id === item.productId);
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
          {unread > 0 ? <View style={styles.unreadDot} /> : null}
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatTop}>
            <Text
              numberOfLines={1}
              style={[styles.peerName, unread > 0 && styles.peerNameUnread]}>
              {other?.name ?? 'Người dùng'}
            </Text>
            <Text style={[styles.time, unread > 0 && styles.timeUnread]}>
              {formatRelativeTime(item.updatedAt)}
            </Text>
          </View>
          {product ? (
            <View style={styles.productRow}>
              <MaterialIcons name="sell" size={15} color={colors.outline} />
              <Text numberOfLines={1} style={styles.productName}>
                {product.title}
              </Text>
            </View>
          ) : null}
          <View style={styles.chatBottom}>
            <Text
              numberOfLines={1}
              style={[styles.preview, unread > 0 && styles.previewUnread]}>
              {lastMessage ? messagePreview(lastMessage) : 'Bắt đầu cuộc trò chuyện'}
            </Text>
            <View style={styles.chatRight}>
              {unread > 0 ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unread > 9 ? '9+' : unread}</Text>
                </View>
              ) : answered ? (
                <MaterialIcons name="done-all" size={18} color={colors.primary} />
              ) : null}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Tin nhắn"
        showBack={false}
        right={<IconButton name="search" onPress={() => router.push('/search')} />}
      />

      <View style={styles.tabsWrap}>
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
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="chat"
            title={
              filter === 'unread'
                ? 'Không có tin nhắn chưa đọc'
                : filter === 'answered'
                  ? 'Chưa trả lời hội thoại nào'
                  : 'Chưa có cuộc trò chuyện nào'
            }
            description={
              filter === 'all'
                ? 'Khi bạn nhắn tin với người bán, các cuộc trò chuyện sẽ xuất hiện tại đây.'
                : 'Tắt bộ lọc để xem toàn bộ hội thoại.'
            }
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
  tabsWrap: {
    height: 64,
  },
  tabsContent: {
    alignItems: 'center',
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
  unreadDot: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.surfaceContainerLowest,
    borderRadius: radius.full,
    borderWidth: 2,
    bottom: 0,
    height: 14,
    position: 'absolute',
    right: 0,
    width: 14,
  },
  chatInfo: {
    flex: 1,
    gap: 3,
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
    color: colors.outline,
    flex: 1,
    fontSize: 12,
  },
  chatBottom: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  preview: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flex: 1,
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
  unreadBadge: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: radius.full,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: colors.onError,
    fontSize: 11,
    fontWeight: '700',
  },
});