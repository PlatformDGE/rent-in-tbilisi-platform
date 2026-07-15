import type { TelegramMediaItem, TelegramRegistryProperty } from '../domain/telegramRegistry';

export function formatRegistryChannelAge(minutes: number) {
  if (minutes < 60) return `${minutes} мин`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`;
  if (minutes < 10080) return `${Math.floor(minutes / 1440)} д ${Math.floor((minutes % 1440) / 60)} ч`;
  return `${Math.floor(minutes / 1440)} дней`;
}

export function getPrimaryRegistryMedia(property: Pick<TelegramRegistryProperty, 'media'>): TelegramMediaItem | undefined {
  return property.media.find((item) => item.isPrimary && item.type === 'image')
    ?? property.media.find((item) => item.type === 'image');
}

export function isRankingProperty(property: Pick<TelegramRegistryProperty, 'repostCount'>) {
  return property.repostCount > 0;
}
