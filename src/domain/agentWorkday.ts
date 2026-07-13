import { MAX_TELEGRAM_PHOTOS } from './constants';
import type { Agent, Deal, Property, Publication } from './types';

export type WorkdayTaskTone = 'danger' | 'warning' | 'success' | 'info';

export type WorkdayTask = {
  id: string;
  title: string;
  value: string;
  description: string;
  to: string;
  tone: WorkdayTaskTone;
};

function nextLevel(percent: number) {
  if (percent < 50) return '50%';
  if (percent < 70) return '70%';
  if (percent < 90) return '90%';
  return 'Top level';
}

export function buildAgentWorkday(agent: Agent | undefined, properties: Property[], deals: Deal[], publications: Publication[]): WorkdayTask[] {
  const agentName = agent?.name || '';
  const agentProperties = properties.filter((property) => property.agent === agentName);
  const activeProperties = agentProperties.filter((property) => !['Archived', 'Rented', 'Sold'].includes(property.status));
  const withoutMedia = activeProperties.filter(
    (property) => property.photos.length < 3 || (!property.videoMeta && !property.videoUrl),
  );
  const needsUpdate = activeProperties.filter((property) => Date.now() - Date.parse(property.updatedAt) > 5 * 24 * 60 * 60 * 1000);
  const needsPublication = activeProperties.filter(
    (property) =>
      property.status === 'In Progress' ||
      !publications.some((publication) => publication.propertyId === property.id && publication.status !== 'Error'),
  );
  const openDeals = deals.filter((deal) => deal.agent === agentName && !['Closed', 'Закрыта'].includes(deal.status));
  const photoLimited = activeProperties.filter((property) => property.photos.length > MAX_TELEGRAM_PHOTOS);
  const commissionSum = deals
    .filter((deal) => deal.agent === agentName)
    .reduce((sum, deal) => sum + (Number(deal.commission.replace(/[^\d.]/g, '')) || 0), 0);
  const percent = agent?.commissionPercent || 50;

  return [
    {
      id: 'new-leads',
      title: 'Новые лиды',
      value: '0',
      description: 'Готово к подключению Lead pipeline через backend.',
      to: '/import',
      tone: 'info',
    },
    {
      id: 'calls-today',
      title: 'Позвонить сегодня',
      value: String(needsUpdate.length),
      description: 'Объекты без свежего обновления больше 5 дней.',
      to: '/properties',
      tone: needsUpdate.length ? 'warning' : 'success',
    },
    {
      id: 'media-needed',
      title: 'Без фото или видео',
      value: String(withoutMedia.length),
      description: 'Нужны минимум 3 фото и видео-ссылка/metadata.',
      to: '/properties',
      tone: withoutMedia.length ? 'danger' : 'success',
    },
    {
      id: 'publications-due',
      title: 'Публикации сегодня',
      value: String(needsPublication.length),
      description: 'Объекты, которые нужно вывести в рекламу.',
      to: '/post-preview',
      tone: needsPublication.length ? 'warning' : 'success',
    },
    {
      id: 'viewings',
      title: 'Просмотры',
      value: '0',
      description: 'Будет считаться из Viewing после backend-подключения.',
      to: '/clients',
      tone: 'info',
    },
    {
      id: 'contracts',
      title: 'Договоры',
      value: String(openDeals.length),
      description: 'Сделки, которые еще не закрыты полностью.',
      to: '/deals',
      tone: openDeals.length ? 'warning' : 'success',
    },
    {
      id: 'photo-order',
      title: 'Проверить album',
      value: String(photoLimited.length),
      description: `Есть объекты с фото сверх лимита Telegram ${MAX_TELEGRAM_PHOTOS}.`,
      to: '/properties',
      tone: photoLimited.length ? 'warning' : 'success',
    },
    {
      id: 'level-progress',
      title: 'Следующий уровень',
      value: nextLevel(percent),
      description: `Текущий процент: ${percent}%. Комиссия в базе: ${commissionSum}$.`,
      to: agent ? `/agents/${agent.id}` : '/agents',
      tone: percent >= 90 ? 'success' : 'info',
    },
  ];
}
