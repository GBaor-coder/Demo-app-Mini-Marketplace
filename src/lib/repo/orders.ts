import { supabase } from '@/src/lib/supabase';
import { Order, OrderStatus } from '@/src/types';
import { createLocation, getLocationById } from './locations';

export type OrderRow = {
  id: string;
  order_code: string;
  buyer_id: string;
  seller_id: string;
  items: OrderItemRow[];
  shipping_fee: number;
  platform_fee: number;
  total: number;
  status: string;
  delivery_method: string;
  delivery_location_id: string | null;
  note: string;
  cancel_reason: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  created_at: string;
};

type OrderItemRow = {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  condition?: string;
  variant?: string;
};

export async function listOrdersForBuyer(buyerId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  const rows = data as OrderRow[];
  return Promise.all(rows.map(mapRowToOrder));
}

export async function listOrdersForSeller(sellerId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  const rows = data as OrderRow[];
  return Promise.all(rows.map(mapRowToOrder));
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return mapRowToOrder(data as OrderRow);
}

export async function createOrder(input: {
  orderCode: string;
  buyerId: string;
  sellerId: string;
  items: Order['items'];
  shippingFee: number;
  platformFee: number;
  total: number;
  deliveryMethod: 'meetup' | 'cod';
  deliveryLocation: { latitude: number; longitude: number; address: string };
  note: string;
}): Promise<Order> {
  const locationRow = await createLocation({
    latitude: input.deliveryLocation.latitude,
    longitude: input.deliveryLocation.longitude,
    address_text: input.deliveryLocation.address,
  });

  const { data, error } = await supabase
    .from('orders')
    .insert({
      order_code: input.orderCode,
      buyer_id: input.buyerId,
      seller_id: input.sellerId,
      items: input.items,
      shipping_fee: input.shippingFee,
      platform_fee: input.platformFee,
      total: input.total,
      status: 'pending',
      delivery_method: input.deliveryMethod,
      delivery_location_id: locationRow.id,
      note: input.note,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Không thể tạo đơn hàng.');
  }

  return mapRowToOrder(data as OrderRow)!;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  reason?: string
): Promise<Order | null> {
  const patch: Record<string, unknown> = { status };

  if (status === 'cancelled' || status === 'rejected') {
    patch.cancel_reason = reason ?? '';
    patch.cancelled_at = new Date().toISOString();
  }
  if (status === 'completed') {
    patch.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('orders')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    return null;
  }

  return mapRowToOrder(data as OrderRow)!;
}

async function mapRowToOrder(row: OrderRow): Promise<Order> {
  let deliveryLocation = {
    latitude: 0,
    longitude: 0,
    address: '',
  };

  if (row.delivery_location_id) {
    const loc = await getLocationById(row.delivery_location_id);
    if (loc) {
      deliveryLocation = {
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.address,
      };
    }
  }

  return {
    id: row.id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    items: (row.items ?? []) as Order['items'],
    shippingFee: row.shipping_fee,
    platformFee: row.platform_fee,
    total: row.total,
    status: row.status as OrderStatus,
    deliveryMethod: row.delivery_method as 'meetup' | 'cod',
    deliveryLocation,
    note: row.note,
    cancelReason: row.cancel_reason ?? undefined,
    cancelledAt: row.cancelled_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    createdAt: row.created_at,
  };
}
