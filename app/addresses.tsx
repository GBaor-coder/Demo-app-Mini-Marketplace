import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState, MaterialIcons } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { SavedAddress } from '@/src/types';

export default function AddressesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { select } = useLocalSearchParams<{ select?: string }>();
  const { addresses, deleteAddress } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const renderItem = ({ item }: { item: SavedAddress }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        if (select === '1') {
          setSelectedId(item.id);
          router.navigate({ pathname: '/checkout', params: { selectedId: item.id } });
        }
      }}
      style={[styles.card, item.isDefault && styles.cardDefault]}>
      <View style={styles.cardTop}>
        <View style={styles.cardLabelWrap}>
          <View style={styles.labelChip}>
            <Text style={styles.cardLabel}>{item.label}</Text>
          </View>
          {item.isDefault ? (
            <View style={styles.defaultTag}>
              <Text style={styles.defaultTagText}>Mặc định</Text>
            </View>
          ) : null}
        </View>
        {select === '1' ? (
          <View style={[styles.radio, selectedId === item.id && styles.radioActive]}>
            {selectedId === item.id ? <View style={styles.radioDot} /> : null}
          </View>
        ) : null}
      </View>
      <Text style={styles.recipient}>
        {item.recipient} · {item.phone}
      </Text>
      <Text style={styles.address} numberOfLines={2}>
        {item.street}, {item.ward}, {item.district}, {item.province}
      </Text>
      {item.building || item.room ? (
        <Text style={styles.building} numberOfLines={1}>
          {[item.building, item.room].filter(Boolean).join(' · ')}
        </Text>
      ) : null}
      {select !== '1' ? (
        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(`/address-form?id=${item.id}`)}
            style={styles.actionBtn}>
            <MaterialIcons name="edit" size={16} color={colors.primary} />
            <Text style={styles.actionText}>Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              Alert.alert('Xóa địa chỉ', 'Bạn có chắc muốn xóa địa chỉ này?', [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa', style: 'destructive', onPress: () => deleteAddress(item.id) },
              ])
            }
            style={styles.actionBtn}>
            <MaterialIcons name="delete" size={16} color={colors.error} />
            <Text style={[styles.actionText, styles.actionTextDanger]}>Xóa</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Sổ địa chỉ</Text>
        <View style={styles.headerBtn} />
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="location-on"
            title="Chưa có địa chỉ nào"
            description="Thêm địa chỉ để việc đặt hàng nhanh chóng hơn."
          >
            <Button title="Thêm địa chỉ" icon="add" onPress={() => router.push('/address-form')} />
          </EmptyState>
        }
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          title="Thêm địa chỉ mới"
          icon="add"
          variant="primary"
          style={styles.footerButton}
          onPress={() => router.push('/address-form')}
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
  list: {
    padding: 20,
    gap: 14,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: 16,
    ...shadow.level1,
  },
  cardDefault: {
    backgroundColor: 'rgba(0,74,198,0.05)',
    borderColor: 'rgba(0,74,198,0.2)',
    borderWidth: 1,
  },
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabelWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  labelChip: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  cardLabel: {
    color: colors.primaryContainer,
    fontSize: 14,
    fontWeight: '600',
  },
  defaultTag: {
    borderColor: colors.error,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  defaultTagText: {
    color: colors.error,
    fontSize: 11,
    fontWeight: '600',
  },
  radio: {
    alignItems: 'center',
    borderColor: colors.outlineVariant,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  radioActive: {
    borderColor: colors.primaryContainer,
  },
  radioDot: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
    height: 12,
    width: 12,
  },
  recipient: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  address: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  building: {
    color: colors.outline,
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    borderTopColor: 'rgba(195,198,215,0.2)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 10,
  },
  actionBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  actionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  actionTextDanger: {
    color: colors.error,
  },
  footer: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    padding: 20,
    ...shadow.level3,
  },
  footerButton: {},
});
