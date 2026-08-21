import { supabase } from '@/src/lib/supabase';
import { SavedAddress } from '@/src/types';
import { createLocation, getLocationById } from './locations';

export type AddressRow = {
  id: string;
  user_id: string;
  label: string;
  recipient: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  building: string;
  room: string;
  location_id: string | null;
  is_default: boolean;
  notes: string;
  created_at: string;
};

export async function listAddresses(userId: string): Promise<SavedAddress[]> {
  const { data, error } = await supabase
    .from('saved_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  const rows = data as AddressRow[];
  return Promise.all(rows.map(mapRowToAddress));
}

export async function createAddress(input: {
  userId: string;
  label: string;
  recipient: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  building: string;
  room: string;
  location: { latitude: number; longitude: number; address: string };
  isDefault: boolean;
  notes: string;
}): Promise<SavedAddress> {
  const locationRow = await createLocation({
    latitude: input.location.latitude,
    longitude: input.location.longitude,
    address_text: input.location.address,
  });

  const { data, error } = await supabase
    .from('saved_addresses')
    .insert({
      user_id: input.userId,
      label: input.label,
      recipient: input.recipient,
      phone: input.phone,
      province: input.province,
      district: input.district,
      ward: input.ward,
      street: input.street,
      building: input.building,
      room: input.room,
      location_id: locationRow.id,
      is_default: input.isDefault,
      notes: input.notes,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Không thể tạo địa chỉ.');
  }

  return mapRowToAddress(data as AddressRow);
}

export async function updateAddress(
  id: string,
  patch: Partial<{
    label: string;
    recipient: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    street: string;
    building: string;
    room: string;
    location: { latitude: number; longitude: number; address: string };
    isDefault: boolean;
    notes: string;
  }>
): Promise<SavedAddress | null> {
  const update: Record<string, unknown> = {};

  if (patch.label !== undefined) update.label = patch.label;
  if (patch.recipient !== undefined) update.recipient = patch.recipient;
  if (patch.phone !== undefined) update.phone = patch.phone;
  if (patch.province !== undefined) update.province = patch.province;
  if (patch.district !== undefined) update.district = patch.district;
  if (patch.ward !== undefined) update.ward = patch.ward;
  if (patch.street !== undefined) update.street = patch.street;
  if (patch.building !== undefined) update.building = patch.building;
  if (patch.room !== undefined) update.room = patch.room;
  if (patch.isDefault !== undefined) update.is_default = patch.isDefault;
  if (patch.notes !== undefined) update.notes = patch.notes;

  if (patch.location) {
    const loc = await createLocation({
      latitude: patch.location.latitude,
      longitude: patch.location.longitude,
      address_text: patch.location.address,
    });
    update.location_id = loc.id;
  }

  const { data, error } = await supabase
    .from('saved_addresses')
    .update(update)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    return null;
  }

  return mapRowToAddress(data as AddressRow);
}

export async function deleteAddress(id: string): Promise<void> {
  const { error } = await supabase.from('saved_addresses').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

async function mapRowToAddress(row: AddressRow): Promise<SavedAddress> {
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
    label: row.label,
    recipient: row.recipient,
    phone: row.phone,
    province: row.province,
    district: row.district,
    ward: row.ward,
    street: row.street,
    building: row.building,
    room: row.room,
    location,
    isDefault: row.is_default,
    notes: row.notes,
  };
}
