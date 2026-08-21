import { supabase } from '@/src/lib/supabase';

export async function uploadProductImage(uri: string, userId: string): Promise<string> {
  try {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error('Không thể đọc file ảnh.');
    }

    const blob = await response.blob();
    const extension = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const finalExtension = validExtensions.includes(extension) ? extension : 'jpg';

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${finalExtension}`;
    const path = `${userId}/${filename}`;

    const { error } = await supabase.storage
      .from('products')
      .upload(path, blob, {
        contentType: `image/${finalExtension === 'jpg' ? 'jpeg' : finalExtension}`,
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data: publicUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Không thể tải ảnh lên.');
  }
}

export async function deleteProductImage(url: string): Promise<void> {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const bucketIndex = pathname.indexOf('/products/');
    if (bucketIndex === -1) return;

    const filePath = pathname.slice(bucketIndex + '/products/'.length);

    const { error } = await supabase.storage.from('products').remove([filePath]);

    if (error) {
      console.warn('Không thể xóa ảnh cũ:', error.message);
    }
  } catch {
    console.warn('Không thể parse URL ảnh để xóa.');
  }
}
