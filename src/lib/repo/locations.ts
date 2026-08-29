import { supabase } from '@/src/lib/supabase';
import { LocationPoint } from '@/src/types';

export type LocationRow = {
  id: string;
  latitude: number;
  longitude: number;
  address_text: string;
  label: string;
  created_by: string | null;
  created_at: string;
};

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function createLocation(input: {
  latitude: number;
  longitude: number;
  address_text: string;
  label?: string;
}): Promise<{ id: string; latitude: number; longitude: number; address: string }> {
  const createdBy = await getCurrentUserId();

  const { data, error } = await supabase
    .from('locations')
    .insert({
      latitude: input.latitude,
      longitude: input.longitude,
      address_text: input.address_text,
      label: input.label ?? '',
      created_by: createdBy,
    })
    .select('id, latitude, longitude, address_text')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Không thể tạo vị trí.');
  }

  return {
    id: data.id,
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.address_text,
  };
}

export async function getLocationById(id: string): Promise<LocationPoint | null> {
  const { data, error } = await supabase
    .from('locations')
    .select('latitude, longitude, address_text')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.address_text,
  };
}

export async function listLocations(): Promise<LocationRow[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  return (data ?? []) as LocationRow[];
}
