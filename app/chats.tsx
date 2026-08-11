import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Avatar } from '@/src/components/Avatar';
import { EmptyState, IconButton, MaterialIcons, ScreenHeader } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { ChatThread } from '@/src/types';
import { formatRelativeTime } from '@/src/utils/format';

export default function BuyerChatsScreen() {
  const router = useRouter();
  const { chats, currentUser, getUserById } = useStore();

  const myChats = chats.filter((thread) =>
    thread.participants.includes(currentUser?.id ?? '')
  );

  const renderItem = ({ item }: { item: ChatThread }) => {
    const otherId =
      item.participants.find((p) => p !== currentUser?.id) ?? item.participants[0];
    const other = getUserById(otherId);
    const lastMessage = item.messages[item.messages.length - 1];
    const unread = item.messages.filter(
      (m) => m.senderId !== currentUser?.id && !m.read
    ).length;
    const online =
      Date.now() - new Date(item.updatedAt).getTime() < 24 * 60 * 60 * 1000;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/chat/${item.id}`)}
        style={styles.chatRow}>
        <View style={styles.avatarWrap}>
          <Avatar uri={other?.avatar} name={other?.name ?? '?'} size={56} />
          <View style={[styles.onlineDot, online ? styles.online : styles.offline]} />
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
          <View style={styles.chatBottom}>
            <Text
              numberOfLines={1}
              style={[styles.preview, unread > 0 && styles.previewUnread]}>
              {lastMessage?.text ?? 'Bắt đầu cuộc trò chuyện'}
            </Text>
            {unread > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Trò chuyện"
        right={
          <IconButton name="search" onPress={() => router.push('/search')} />
        }
      />

      <View style={styles.searchWrap}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/search')}
          style={styles.searchBar}>
          <MaterialIcons name="search" size={19} color={colors.outline} />
          <Text style={styles.searchPlaceholder}>Tìm kiếm tin nhắn...</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={myChats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="chat"
            title="Chưa có cuộc trò chuyện nào"
            description="Khi bạn nhắn tin với người bán, các cuộc trò chuyện sẽ xuất hiện tại đây."
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
  searchWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  searchPlaceholder: {
    color: colors.outline,
    fontSize: 15,
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
    gap: 4,
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
