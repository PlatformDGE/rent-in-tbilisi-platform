import type { Currency, PropertyStatus } from '../../domain/property';
export const formatPrice = (price: number, currency: Currency) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
export const formatDate = (value: string) => new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
export const statusClass = (status: PropertyStatus) => `property-status property-status--${status === 'Архив' || status === 'Отклонён' ? 'muted' : status === 'Сдан' || status === 'Продан' ? 'success' : status === 'Новый' ? 'new' : 'progress'}`;
