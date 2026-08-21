import { supabase } from '@/src/lib/supabase';
import { Review } from '@/src/types';

type ReviewRow = {
  id: string;
  order_id: string;
  author_id: string;
  product_id: string;
  rating: number;
  content: string;
  images: string[];
  created_at: string;
};

export async function listReviewsByProduct(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as ReviewRow[]).map((row) => ({
    id: row.id,
    orderId: row.order_id,
    authorId: row.author_id,
    productId: row.product_id,
    rating: row.rating,
    content: row.content,
    images: row.images ?? [],
    createdAt: row.created_at,
  }));
}

export async function createReview(input: {
  orderId: string;
  authorId: string;
  productId: string;
  rating: number;
  content: string;
  images: string[];
}): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      order_id: input.orderId,
      author_id: input.authorId,
      product_id: input.productId,
      rating: input.rating,
      content: input.content,
      images: input.images,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Không thể tạo đánh giá.');
  }

  return {
    id: data.id,
    orderId: data.order_id,
    authorId: data.author_id,
    productId: data.product_id,
    rating: data.rating,
    content: data.content,
    images: data.images ?? [],
    createdAt: data.created_at,
  };
}
