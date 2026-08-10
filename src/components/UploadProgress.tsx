import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radius, typography } from '@/src/theme/colors';

export type UploadProgressItem = {
  id: string;
  uri: string;
  name: string;
  size?: number;
  progress: number;
  status: 'uploading' | 'done' | 'error';
};

type UploadProgressProps = {
  items: UploadProgressItem[];
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
};

function formatSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadProgress({ items, onRetry, onRemove }: UploadProgressProps) {
  if (items.length === 0) return null;
  return (
    <View style={styles.wrap}>
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.thumb}>
            <Image contentFit="cover" source={{ uri: item.uri }} style={styles.thumbImage} />
          </View>
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text numberOfLines={1} style={styles.name}>
                {item.name}
              </Text>
              <Text style={styles.size}>{formatSize(item.size)}</Text>
            </View>
            {item.status === 'error' ? (
              <Text style={styles.errorText}>Tải lên thất bại</Text>
            ) : item.status === 'done' ? (
              <View style={styles.doneRow}>
                <Ionicons name="checkmark-circle" size={14} color={colors.tertiary} />
                <Text style={styles.doneText}>Đã tải lên</Text>
              </View>
            ) : (
              <View style={styles.barWrap}>
                <View style={styles.bar}>
                  <View style={[styles.barFill, { width: `${Math.max(4, item.progress)}%` }]} />
                </View>
                <Text style={styles.percent}>{Math.round(item.progress)}%</Text>
              </View>
            )}
          </View>
          {item.status === 'error' ? (
            <TouchableOpacity
              onPress={() => onRetry(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.actionButton}>
              <Ionicons name="refresh" size={18} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => onRemove(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.actionButton}>
              <Ionicons name="close" size={18} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 10,
  },
  thumb: {
    borderRadius: radius.lg,
    height: 52,
    overflow: 'hidden',
    width: 52,
  },
  thumbImage: {
    height: '100%',
    width: '100%',
  },
  info: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  name: {
    ...typography.labelMd,
    color: colors.onSurface,
    flex: 1,
  },
  size: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
  barWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  bar: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.full,
    flex: 1,
    height: 6,
    overflow: 'hidden',
  },
  barFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: '100%',
  },
  percent: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    minWidth: 34,
    textAlign: 'right',
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
  },
  doneRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  doneText: {
    color: colors.tertiary,
    fontSize: 13,
  },
  actionButton: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
});
