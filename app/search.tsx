import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductCard } from '@/src/components/ProductCard';
import { Button, Chip, EmptyState, MaterialIcons } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { CATEGORIES } from '@/src/data/seed';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { Product, ProductCategory, ProductCondition } from '@/src/types';
import {
  applyFilters,
  countActiveFilters,
  DEFAULT_FILTERS,
  SearchFilters,
} from '@/src/utils/filter';

const CONDITIONS: ProductCondition[] = ['Mới', 'Như mới', 'Đã sử dụng'];

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products } = useStore();

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setFilters((f) => ({ ...f, query: query.trim() }));
  }, [query]);

  const results = useMemo(() => applyFilters(products, filters), [filters, products]);
  const activeCount = countActiveFilters(filters);

  const applyDraft = (draft: SearchFilters) => {
    setFilters({ ...draft, query: query.trim() });
    setSheetOpen(false);
  };

  const clearQuery = () => {
    setQuery('');
    setFilters((f) => ({ ...f, query: '' }));
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={19} color={colors.outline} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm kiếm giáo trình, thiết bị..."
            placeholderTextColor={colors.outline}
            style={styles.searchInput}
            returnKeyType="search"
            autoFocus
          />
          {query ? (
            <TouchableOpacity onPress={clearQuery} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialIcons name="close" size={18} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={() => setSheetOpen(true)}
          style={styles.filterBtn}>
          <MaterialIcons name="tune" size={22} color={colors.primary} />
          {activeCount > 0 ? <View style={styles.filterDot} /> : null}
        </TouchableOpacity>
      </View>

      <View style={styles.chipRow}>
        {filters.categories.length > 0 ? (
          <Chip label={`Danh mục (${filters.categories.length})`} selected onPress={() => setSheetOpen(true)} icon="expand-more" />
        ) : null}
        {filters.maxPrice !== undefined || filters.minPrice !== undefined ? (
          <Chip label="Giá" selected onPress={() => setSheetOpen(true)} icon="expand-more" />
        ) : null}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.resultsCount}>Kết quả ({results.length})</Text>
        }
        renderItem={({ item }: { item: Product }) => (
          <ProductCard
            product={item}
            onPress={() => router.push(`/product/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-off"
            title="Rất tiếc, không tìm thấy sản phẩm phù hợp"
            description="Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem thêm kết quả nhé."
          >
            <Button
              title="Xóa bộ lọc"
              variant="outline"
              onPress={() => setFilters({ ...DEFAULT_FILTERS, query: '' })}
            />
          </EmptyState>
        }
      />

      <FilterSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        initial={filters}
        onApply={applyDraft}
      />
    </View>
  );
}

type FilterSheetProps = {
  visible: boolean;
  onClose: () => void;
  initial: SearchFilters;
  onApply: (filters: SearchFilters) => void;
};

function FilterSheet({ visible, onClose, initial, onApply }: FilterSheetProps) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<SearchFilters>(initial);
  const [minPrice, setMinPrice] = useState(initial.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice?.toString() ?? '');
  const [distance, setDistance] = useState(initial.maxDistanceKm ?? 5);

  const toggleCategory = (category: ProductCategory) => {
    setDraft((d) => ({
      ...d,
      categories: d.categories.includes(category)
        ? d.categories.filter((c) => c !== category)
        : [...d.categories, category],
    }));
  };

  const toggleCondition = (condition: ProductCondition) => {
    setDraft((d) => ({
      ...d,
      conditions: d.conditions.includes(condition)
        ? d.conditions.filter((c) => c !== condition)
        : [...d.conditions, condition],
    }));
  };

  const reset = () => {
    setDraft({ ...DEFAULT_FILTERS, query: initial.query });
    setMinPrice('');
    setMaxPrice('');
    setDistance(5);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => onApply({ ...draft, minPrice: minPrice ? Number(minPrice) : undefined, maxPrice: maxPrice ? Number(maxPrice) : undefined, maxDistanceKm: distance })}>
      <View style={styles.modalRoot}>
        <TouchableOpacity style={styles.scrim} activeOpacity={1} onPress={() => onApply({ ...draft, minPrice: minPrice ? Number(minPrice) : undefined, maxPrice: maxPrice ? Number(maxPrice) : undefined, maxDistanceKm: distance })} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Bộ lọc</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialIcons name="close" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>
            <Text style={styles.sheetSectionLabel}>DANH MỤC</Text>
            <View style={styles.chipWrap}>
              {CATEGORIES.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  selected={draft.categories.includes(category)}
                  onPress={() => toggleCategory(category)}
                />
              ))}
            </View>

            <Text style={styles.sheetSectionLabel}>KHOẢNG GIÁ (VND)</Text>
            <View style={styles.priceRow}>
              <TextInput
                value={minPrice}
                onChangeText={setMinPrice}
                placeholder="Tối thiểu"
                placeholderTextColor={colors.outline}
                keyboardType="number-pad"
                style={styles.priceInput}
              />
              <Text style={styles.priceSep}>-</Text>
              <TextInput
                value={maxPrice}
                onChangeText={setMaxPrice}
                placeholder="Tối đa"
                placeholderTextColor={colors.outline}
                keyboardType="number-pad"
                style={styles.priceInput}
              />
            </View>

            <Text style={styles.sheetSectionLabel}>TÌNH TRẠNG</Text>
            <View style={styles.conditionGrid}>
              {CONDITIONS.map((condition) => {
                const selected = draft.conditions.includes(condition);
                return (
                  <TouchableOpacity
                    key={condition}
                    activeOpacity={0.85}
                    onPress={() => toggleCondition(condition)}
                    style={[styles.conditionCard, selected && styles.conditionCardActive]}>
                    <Text style={[styles.conditionText, selected && styles.conditionTextActive]}>
                      {condition}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.distanceHeader}>
              <Text style={styles.sheetSectionLabel}>KHOẢNG CÁCH</Text>
              <Text style={styles.distanceValue}>Dưới {distance} km</Text>
            </View>
            <View style={styles.sliderWrap}>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${(distance / 20) * 100}%` }]} />
                <View style={[styles.sliderThumb, { left: `${(distance / 20) * 100}%` }]} />
              </View>
              <TouchableOpacity
                style={styles.sliderTouch}
                onPress={(e) => {
                  const x = e.nativeEvent.locationX;
                  const pct = Math.min(Math.max(x / 340, 0.05), 1);
                  setDistance(Math.round((pct * 20) / 1) * 1);
                }}
              />
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>1 km</Text>
              <Text style={styles.sliderLabel}>10 km</Text>
              <Text style={styles.sliderLabel}>20 km</Text>
            </View>

          </ScrollView>

          <View style={styles.sheetFooter}>
            <Button title="Thiết lập lại" variant="outline" onPress={reset} style={styles.resetButton} />
          </View>
        </View>
      </View>
    </Modal>
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
    gap: 10,
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
  searchBar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: colors.onSurface,
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
  },
  filterBtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    position: 'relative',
    width: 36,
  },
  filterDot: {
    backgroundColor: colors.error,
    borderColor: colors.surface,
    borderRadius: 5,
    borderWidth: 2,
    height: 10,
    position: 'absolute',
    right: 0,
    top: 2,
    width: 10,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  list: {
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  row: {
    gap: 12,
    justifyContent: 'space-between',
  },
  resultsCount: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontSize: 17,
    marginBottom: 14,
    marginTop: 4,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(33,49,69,0.4)',
  },
  sheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    maxHeight: '88%',
    ...shadow.level3,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.outlineVariant,
    borderRadius: radius.full,
    height: 4,
    marginTop: 10,
    width: 40,
  },
  sheetHeader: {
    alignItems: 'center',
    borderBottomColor: colors.outlineVariant,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sheetTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    fontSize: 18,
  },
  sheetBody: {
    padding: 20,
  },
  sheetSectionLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 16,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  priceInput: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    color: colors.onSurface,
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  priceSep: {
    color: colors.onSurfaceVariant,
    fontSize: 15,
    fontWeight: '700',
  },
  conditionGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  conditionCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: 'rgba(195,198,215,0.5)',
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  conditionCardActive: {
    backgroundColor: 'rgba(0,74,198,0.05)',
    borderColor: colors.primaryContainer,
  },
  conditionText: {
    color: colors.onSurface,
    fontSize: 15,
    textAlign: 'center',
  },
  conditionTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  distanceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distanceValue: {
    color: colors.primaryContainer,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 16,
  },
  sliderWrap: {
    justifyContent: 'center',
    height: 40,
  },
  sliderTrack: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.full,
    height: 4,
  },
  sliderFill: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
    height: '100%',
    width: '25%',
  },
  sliderThumb: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 18,
    left: '25%',
    marginLeft: -9,
    position: 'absolute',
    top: -7,
    width: 18,
  },
  sliderTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    color: colors.outline,
    fontSize: 12,
  },
  sheetFooter: {
    borderTopColor: colors.outlineVariant,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  resetButton: {
    flex: 1,
  },
});
