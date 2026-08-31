import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductCard } from '@/src/components/ProductCard';
import { Button, Chip, EmptyState, MaterialIcons } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';
import { colors, radius, shadow, typography } from '@/src/theme/colors';
import { Product } from '@/src/types';
import { applyFilters, countActiveFilters, SearchFilters } from '@/src/utils/filter';

export default function SearchResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products } = useStore();
  const params = useLocalSearchParams<{ query?: string; category?: string }>();

  const [filters, setFilters] = useState<SearchFilters>({
    query: (params.query ?? '').trim(),
    categories: params.category ? [params.category as SearchFilters['categories'][number]] : [],
    conditions: [],
    sort: 'newest',
  });

  const results = useMemo(() => applyFilters(products, filters), [filters, products]);
  const activeCount = countActiveFilters(filters);

  const removeCategory = (category: string) => {
    setFilters((f) => ({ ...f, categories: f.categories.filter((c) => c !== category) }));
  };

  const reset = () => {
    setFilters({
      query: (params.query ?? '').trim(),
      categories: params.category ? [params.category as SearchFilters['categories'][number]] : [],
      conditions: [],
      sort: 'newest',
    });
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/search')}
          style={styles.searchBar}>
          <MaterialIcons name="search" size={18} color={colors.outline} />
          <Text style={styles.searchText} numberOfLines={1}>
            {filters.query ? `“${filters.query}”` : 'Tìm kiếm sản phẩm'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/search')}
          style={styles.filterBtn}>
          <MaterialIcons name="tune" size={22} color={colors.primary} />
          {activeCount > 0 ? <View style={styles.filterDot} /> : null}
        </TouchableOpacity>
      </View>

      <View style={styles.chipRow}>
        {filters.query ? (
          <Chip
            label={`"${filters.query}"`}
            onPress={() => setFilters((f) => ({ ...f, query: '' }))}
          />
        ) : null}
        {filters.categories.map((category) => (
          <Chip key={category} label={category} onPress={() => removeCategory(category)} />
        ))}
        {activeCount > 0 ? (
          <TouchableOpacity onPress={reset}>
            <Text style={styles.resetText}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Text style={styles.resultsCount}>{results.length} sản phẩm</Text>}
        renderItem={({ item }: { item: Product }) => (
          <ProductCard product={item} onPress={() => router.push(`/product/${item.id}`)} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-off"
            title="Rất tiếc, không tìm thấy sản phẩm phù hợp"
            description="Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem thêm kết quả nhé."
          >
            <Button title="Thử lại" variant="outline" onPress={reset} />
            <Button title="Khám phá thêm" onPress={() => router.push('/')} />
          </EmptyState>
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
  searchText: {
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
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resetText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
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
});
