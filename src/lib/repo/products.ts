import { supabase } from '@/src/lib/supabase';
import { Product, ProductCategory, ProductCondition, ProductStatus } from '@/src/types';
import { getCurrentUserId, getLocationById } from './locations';

export type ProductRow = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  stock: number;
  image: string;
  images: string[];
  location_id: string | null;
  meetup_point: string;
  allows_meetup: boolean;
  allows_cod: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

export async function listProducts(filters?: {
  sellerId?: string;
  category?: ProductCategory;
  condition?: ProductCondition;
  status?: ProductStatus;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.sellerId) {
    query = query.eq('seller_id', filters.sellerId);
  }
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.condition) {
    query = query.eq('condition', filters.condition);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }
  if (filters?.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }
  if (filters?.query) {
    query = query.or(
      `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`
    );
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  const rows = data as ProductRow[];
  const mapped = await Promise.all(
    rows.map(async (row) => mapRowToProduct(row))
  );

  return mapped.filter((p): p is Product => p !== null);
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  const row = data as ProductRow;
  return await mapRowToProduct(row);
}

export async function createProduct(input: {
  sellerId: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  condition: ProductCondition;
  stock: number;
  image: string;
  images: string[];
  location: { latitude: number; longitude: number; address: string };
  meetupPoint?: string;
  allowsMeetup: boolean;
  allowsCod: boolean;
  status?: ProductStatus;
}): Promise<Product> {
  const locationRow = await createLocationForProduct(input.location);
  const sellerId = await getCurrentUserId();
  console.log('[createProduct] sellerId from getCurrentUserId:', sellerId);

  const { data: { user } } = await supabase.auth.getUser();
  console.log('[createProduct] auth.getUser() id:', user?.id);

  if (!sellerId || !user?.id || sellerId !== user.id) {
    throw new Error('Xác thực người dùng không hợp lệ.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', sellerId)
    .single();

  console.log('[createProduct] profile exists:', !!profile, 'error:', profileError?.message);

  const payload = {
    seller_id: sellerId,
    title: input.title,
    description: input.description,
    price: input.price,
    category: input.category,
    condition: input.condition,
    stock: input.stock,
    image: input.image,
    images: input.images,
    location_id: locationRow.id,
    meetup_point: input.meetupPoint ?? '',
    allows_meetup: input.allowsMeetup,
    allows_cod: input.allowsCod,
    status: input.status ?? 'active',
  };

  console.log('[createProduct] payload seller_id:', payload.seller_id);

  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('[createProduct] insert error:', error);
    throw new Error(error?.message ?? 'Không thể tạo sản phẩm.');
  }

  if (!data) {
    throw new Error('Không thể tạo sản phẩm.');
  }

  const product = await mapRowToProduct(data as ProductRow);
  if (!product) {
    throw new Error('Không thể ánh xạ sản phẩm.');
  }

  return product;
}

export async function updateProduct(
  id: string,
  input: {
    title?: string;
    description?: string;
    price?: number;
    category?: ProductCategory;
    condition?: ProductCondition;
    stock?: number;
    image?: string;
    images?: string[];
    location?: { latitude: number; longitude: number; address: string };
    meetupPoint?: string;
    allowsMeetup?: boolean;
    allowsCod?: boolean;
    status?: ProductStatus;
  }
): Promise<Product | null> {
  const existing = await getProductById(id);
  if (!existing) return null;

  const patch: Record<string, unknown> = {};

  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.price !== undefined) patch.price = input.price;
  if (input.category !== undefined) patch.category = input.category;
  if (input.condition !== undefined) patch.condition = input.condition;
  if (input.stock !== undefined) patch.stock = input.stock;
  if (input.image !== undefined) patch.image = input.image;
  if (input.images !== undefined) patch.images = input.images;
  if (input.allowsMeetup !== undefined) patch.allows_meetup = input.allowsMeetup;
  if (input.allowsCod !== undefined) patch.allows_cod = input.allowsCod;
  if (input.status !== undefined) patch.status = input.status;
  if (input.meetupPoint !== undefined) patch.meetup_point = input.meetupPoint;

  if (input.location) {
    const loc = await createLocationForProduct(input.location);
    patch.location_id = loc.id;
  }

  const { data, error } = await supabase
    .from('products')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    return null;
  }

  return await mapRowToProduct(data as ProductRow)!;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markProductSold(id: string): Promise<void> {
  const { error } = await supabase.rpc('mark_product_sold', {
    p_product_id: id,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function restoreProductStock(
  id: string,
  quantity: number
): Promise<void> {
  const { error } = await supabase.rpc('restore_product_stock', {
    p_product_id: id,
    p_qty: quantity,
  });

  if (error) {
    console.warn('[restoreProductStock] DB error:', id, error.message);
    throw new Error(error.message);
  }
}

export async function syncProductStock(
  id: string,
  newStock: number
): Promise<{ stock: number; status: ProductStatus } | null> {
  const safeStock = Math.max(0, Math.floor(newStock));
  const { data, error } = await supabase
    .rpc('sync_product_stock', { p_product_id: id, p_stock: safeStock })
    .maybeSingle();

  if (error) {
    console.warn('[syncProductStock] DB error:', id, error.message);
    return null;
  }

  if (!data) {
    console.warn('[syncProductStock] No row updated for id:', id);
    return null;
  }

  const row = data as { o_stock: number; o_status: string };
  return {
    stock: row.o_stock,
    status: row.o_status as ProductStatus,
  };
}

async function createLocationForProduct(location: {
  latitude: number;
  longitude: number;
  address: string;
}) {
  const createdBy = await getCurrentUserId();

  const { data, error } = await supabase
    .from('locations')
    .insert({
      latitude: location.latitude,
      longitude: location.longitude,
      address_text: location.address,
      label: '',
      created_by: createdBy,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Không thể tạo vị trí sản phẩm.');
  }

  return data as { id: string };
}

async function mapRowToProduct(row: ProductRow): Promise<Product | null> {
  let location = {
    latitude: 0,
    longitude: 0,
    address: '',
  };

  if (row.location_id) {
    const loc = await getLocationById(row.location_id);
    if (loc) {
      location = {
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.address,
      };
    }
  }

  return {
    id: row.id,
    sellerId: row.seller_id,
    title: row.title,
    description: row.description,
    price: row.price,
    category: row.category as ProductCategory,
    condition: row.condition as ProductCondition,
    stock: row.stock,
    image: row.image,
    images: row.images ?? [],
    location,
    meetupPoint: row.meetup_point || undefined,
    allowsMeetup: row.allows_meetup,
    allowsCod: row.allows_cod,
    status: row.status as ProductStatus,
    createdAt: row.created_at,
  };
}
