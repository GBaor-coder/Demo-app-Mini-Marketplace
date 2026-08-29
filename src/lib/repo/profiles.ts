import { supabase } from '@/src/lib/supabase';
import { User } from '@/src/types';

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  campus: string | null;
  verified: boolean | null;
  rating: number | null;
  review_count: number | null;
  bio: string | null;
  seller_since: string | null;
};

function mapProfileToUser(profile: ProfileRow): User {
  return {
    id: profile.id,
    name: profile.name ?? 'Người dùng',
    email: profile.email ?? '',
    password: '',
    phone: profile.phone ?? '',
    avatar:
      profile.avatar ??
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
    campus: profile.campus ?? '',
    verified: profile.verified ?? false,
    rating: profile.rating ?? 0,
    reviewCount: profile.review_count ?? 0,
    bio: profile.bio ?? undefined,
    sellerSince: profile.seller_since ?? undefined,
  };
}

export async function getProfileById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapProfileToUser(data as ProfileRow);
}

export async function getProfilesByIds(userIds: string[]): Promise<User[]> {
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', ids);

  if (error || !data) {
    return [];
  }

  return (data as ProfileRow[]).map(mapProfileToUser);
}
