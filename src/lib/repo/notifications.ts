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
  link: string | null;
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
    link: row.link ?? undefined,
  }));
}

export async function createNotification(input: {
  userId: string;
  type: AppNotification['type'];
  title: string;
  body: string;
  icon: string;
  link?: string;
}): Promise<AppNotification | null> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      icon: input.icon,
      read: false,
      link: input.link ?? null,
    })
    .select('*')
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    type: data.type as AppNotification['type'],
    title: data.title,
    body: data.body,
    createdAt: data.created_at,
    read: data.read,
    icon: data.icon,
    link: data.link ?? undefined,
  };
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
