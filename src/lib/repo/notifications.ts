import { supabase } from '@/src/lib/supabase';
import { AppNotification } from '@/src/types';

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  icon: string;
  read: boolean;
  created_at: string;
};

export async function listNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as NotificationRow[]).map((row) => ({
    id: row.id,
    type: row.type as AppNotification['type'],
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    read: row.read,
    icon: row.icon,
  }));
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    throw new Error(error.message);
  }
}
