import { supabase } from '@/src/lib/supabase';

export async function listFavorites(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', userId);

  if (error || !data) {
    return [];
  }

  return data.map((row) => row.product_id);
}

export async function toggleFavorite(userId: string, productId: string): Promise<boolean> {
  const { data: existing, error: fetchError } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (existing) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw new Error(error.message);
    return false;
  }

  const { error } = await supabase.from('favorites').insert({
    user_id: userId,
    product_id: productId,
  });

  if (error) throw new Error(error.message);
  return true;
}
