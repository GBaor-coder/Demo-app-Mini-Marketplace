import { supabase } from '@/src/lib/supabase';
import { ChatMessage, ChatThread } from '@/src/types';
import { createLocation, getLocationById } from './locations';

export type ChatThreadRow = {
  id: string;
  participant_1: string;
  participant_2: string;
  product_id: string;
  updated_at: string;
  created_at: string;
};

export type ChatMessageRow = {
  id: string;
  thread_id: string;
  sender_id: string;
  text: string;
  read: boolean;
  offer_location_id: string | null;
  created_at: string;
};

export async function listChatThreads(userId: string): Promise<ChatThread[]> {
  const { data, error } = await supabase
    .from('chat_threads')
    .select('*')
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  const threads = data as ChatThreadRow[];
  return Promise.all(
    threads.map(async (thread) => {
      const messages = await listMessages(thread.id);
      return mapRowToThread(thread, messages);
    })
  );
}

export async function getChatThread(id: string): Promise<ChatThread | null> {
  const { data, error } = await supabase
    .from('chat_threads')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  const messages = await listMessages(id);
  return mapRowToThread(data as ChatThreadRow, messages);
}

export async function createChatThread(input: {
  participant1: string;
  participant2: string;
  productId: string;
}): Promise<ChatThread> {
  const { data, error } = await supabase
    .from('chat_threads')
    .insert({
      participant_1: input.participant1,
      participant_2: input.participant2,
      product_id: input.productId,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Không thể tạo cuộc trò chuyện.');
  }

  return mapRowToThread(data as ChatThreadRow, []);
}

export async function listMessages(threadId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (error || !data) {
    return [];
  }

  return Promise.all((data as ChatMessageRow[]).map(mapRowToMessage));
}

export async function sendMessage(input: {
  threadId: string;
  senderId: string;
  text: string;
  offerLocation?: { latitude: number; longitude: number; address: string };
}): Promise<ChatMessage> {
  let offerLocationId: string | null = null;

  if (input.offerLocation) {
    const loc = await createLocation({
      latitude: input.offerLocation.latitude,
      longitude: input.offerLocation.longitude,
      address_text: input.offerLocation.address,
    });
    offerLocationId = loc.id;
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      thread_id: input.threadId,
      sender_id: input.senderId,
      text: input.text,
      read: false,
      offer_location_id: offerLocationId,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Không thể gửi tin nhắn.');
  }

  await supabase
    .from('chat_threads')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', input.threadId);

  return mapRowToMessage(data as ChatMessageRow);
}

async function mapRowToThread(row: ChatThreadRow, messages: ChatMessage[]): Promise<ChatThread> {
  return {
    id: row.id,
    participants: [row.participant_1, row.participant_2] as [string, string],
    productId: row.product_id,
    messages,
    updatedAt: row.updated_at,
  };
}

async function mapRowToMessage(row: ChatMessageRow): Promise<ChatMessage> {
  let offerLocation;

  if (row.offer_location_id) {
    const loc = await getLocationById(row.offer_location_id);
    if (loc) {
      offerLocation = {
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.address,
      };
    }
  }

  return {
    id: row.id,
    senderId: row.sender_id,
    text: row.text,
    createdAt: row.created_at,
    read: row.read,
    offerLocation,
  };
}
