import { OrderStatus } from '@/src/types';

export function formatCurrency(value: number) {
  return `${Math.max(0, Math.round(value)).toLocaleString('vi-VN')}đ`;
}

export function formatCurrencyFull(value: number) {
  return `${Math.max(0, Math.round(value)).toLocaleString('vi-VN')} ₫`;
}

export function formatCompact(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }
  return `${value}`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return formatDate(value);
}

export function formatClock(value: string) {
  return new Date(value).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function normalizeSearch(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

export function distanceLabel(km: number) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  in_transaction: 'Đang giao dịch',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
  rejected: 'Đã từ chối',
};

export const ORDER_STATUS_ICONS: Record<OrderStatus, string> = {
  pending: 'pending_actions',
  confirmed: 'fact_check',
  in_transaction: 'local_shipping',
  completed: 'task_alt',
  cancelled: 'cancel',
  rejected: 'do_not_disturb_on',
};
