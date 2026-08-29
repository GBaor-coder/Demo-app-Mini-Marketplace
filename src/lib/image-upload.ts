import { supabase } from '@/src/lib/supabase';

type DetectedImageType = { mime: string; extension: string };

function detectImageType(bytes: Uint8Array): DetectedImageType {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: 'image/jpeg', extension: 'jpg' };
  }
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { mime: 'image/png', extension: 'png' };
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return { mime: 'image/gif', extension: 'gif' };
  }
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { mime: 'image/webp', extension: 'webp' };
  }
  throw new Error('Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh JPG, PNG, WEBP hoặc GIF.');
}

export async function uploadProductImage(uri: string, userId: string): Promise<string> {
  try {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error('Không thể đọc file ảnh.');
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      throw new Error('File ảnh rỗng hoặc không đọc được.');
    }

    const { mime, extension } = detectImageType(new Uint8Array(arrayBuffer));

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const path = `${userId}/${filename}`;

    const { error } = await supabase.storage.from('products').upload(path, arrayBuffer, {
      contentType: mime,
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
    console.warn('[uploadProductImage] Tải ảnh lên thất bại:', uri, err);
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
