import { Product, ProductCategory, ProductCondition } from '@/src/types';
import { normalizeSearch } from '@/src/utils/format';

export type SearchFilters = {
  query: string;
  categories: ProductCategory[];
  minPrice?: number;
  maxPrice?: number;
  conditions: ProductCondition[];
  maxDistanceKm?: number;
  sort: 'newest' | 'price_asc' | 'price_desc' | 'nearest';
};

export const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  categories: [],
  conditions: [],
  sort: 'newest',
};

const DEFAULT_LOCATION = { latitude: 10.420556, longitude: 105.643333 };

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function distanceFromCenter(lat: number, lng: number) {
  return haversineKm(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, lat, lng);
}

export const MAX_MEETUP_DISTANCE_KM = 8;

export function distanceFromSchoolKm(lat: number, lng: number) {
  return distanceFromCenter(lat, lng);
}

export function applyFilters(products: Product[], filters: SearchFilters): Product[] {
  const q = normalizeSearch(filters.query);

  const result = products.filter((product) => {
    if (product.status !== 'active') {
      return false;
    }
    if (q) {
      const haystack = normalizeSearch(
        `${product.title} ${product.description} ${product.category} ${product.location.address}`
      );
      if (!haystack.includes(q)) {
        return false;
      }
    }
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false;
    }
    if (filters.conditions.length > 0 && !filters.conditions.includes(product.condition)) {
      return false;
    }
    if (filters.minPrice !== undefined && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
      return false;
    }
    if (
      filters.maxDistanceKm !== undefined &&
      haversineKm(
        DEFAULT_LOCATION.latitude,
        DEFAULT_LOCATION.longitude,
        product.location.latitude,
        product.location.longitude
      ) > filters.maxDistanceKm
    ) {      return false;
    }
    return true;
  });

  const sorted = [...result];
  switch (filters.sort) {
    case 'price_asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'nearest':
      sorted.sort(
        (a, b) =>
          haversineKm(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, a.location.latitude, a.location.longitude) -
          haversineKm(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, b.location.latitude, b.location.longitude)
      );
      break;
    default:
      sorted.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  }

  return sorted;
}

export function countActiveFilters(filters: SearchFilters): number {
  let count = 0;
  if (filters.categories.length > 0) count += 1;
  if (filters.conditions.length > 0) count += 1;
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count += 1;
  if (filters.maxDistanceKm !== undefined) count += 1;
  return count;
}

export function getSimilarProducts(
  current: Product,
  all: Product[],
  limit = 6
): Product[] {
  const candidates = all.filter(
    (p) =>
      p.id !== current.id &&
      p.status === 'active' &&
      p.category === current.category
  );
  const score = (p: Product): number => {
    let s = 0;
    if (p.sellerId !== current.sellerId) s += 10;
    if (p.condition === current.condition) s += 1;
    return s;
  };
  return [...candidates]
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}
