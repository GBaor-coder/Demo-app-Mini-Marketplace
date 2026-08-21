import { supabase } from '@/src/lib/supabase';
import { CartLine } from '@/src/types';

export async function listCartLines(userId: string): Promise<CartLine[]> {
  const { data, error } = await supabase
    .from('cart_lines')
    .select('product_id, quantity, selected')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    productId: row.product_id,
    quantity: row.quantity,
    selected: row.selected,
  }));
}

export async function upsertCartLine(
  userId: string,
  productId: string,
  quantity: number,
  selected: boolean
): Promise<void> {
  const { error } = await supabase.from('cart_lines').upsert(
    {
      user_id: userId,
      product_id: productId,
      quantity,
      selected,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,product_id' }
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteCartLine(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from('cart_lines')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function clearCart(userId: string): Promise<void> {
  const { error } = await supabase
    .from('cart_lines')
    .delete()
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}
