import { ExternalLink, MessageCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { EmptyStateCard, LoadingState, SectionHeader } from './ui';
import { TELEGRAM_ASSET_BASE_URL } from '../config/runtime';

const TELEGRAM_DATA_URL = `${import.meta.env.BASE_URL}telegram-top10.json`;

export type TelegramItem = {
  id: string;
  title: string;
  price: number | null;
  area: number | null;
  district: string;
  metro: string;
  rooms: number | null;
  floor: string;
  daily_reposts: number;
  repostCount: number;
  current_forwards: number;
  published_at: string;
  post_url: string;
  image: string;
  latitude: number | null;
  longitude: number | null;
  firstSeenAt?: string;
  lastSeenAt?: string;
  daysOnChannel?: number;
  lifecycleStatus?: 'active' | 'rented' | 'sold' | 'removed';
  rentedAt?: string | null;
  daysUntilRented?: number | null;
  soldAt?: string | null;
  daysUntilSold?: number | null;
  daysUntilClosed?: number | null;
  closedAt?: string | null;
  confirmationTelegramUrl?: string | null;
  sourceTelegramUrl?: string | null;
  sourceTelegramMessageId?: string | null;
  timerLabel?: string;
  performanceStatus?: 'fast' | 'normal' | 'slow';
  highestRank?: number;
  maxRepostCount?: number;
  currentRank?: number;
  propertyKey?: string;
};

type TelegramPayload = {
  status: string;
  updated_at: string;
  items: TelegramItem[];
  recentlyRented?: TelegramItem[];
};

function dayWord(value: number) {
  const mod100 = value % 100;
  const mod10 = value % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'дней';
  if (mod10 === 1) return 'день';
  if (mod10 >= 2 && mod10 <= 4) return 'дня';
  return 'дней';
}

function channelLabel(firstSeenAt: string, now: number) {
  const elapsedMinutes = Math.max(Math.floor((now - new Date(firstSeenAt).getTime()) / 60_000), 0);
  if (elapsedMinutes === 0) return 'Сегодня';
  if (elapsedMinutes < 60) return `${elapsedMinutes} мин`;
  if (elapsedMinutes < 24 * 60) return `${Math.floor(elapsedMinutes / 60)} ч ${elapsedMinutes % 60} мин`;
  if (elapsedMinutes < 7 * 24 * 60) return `${Math.floor(elapsedMinutes / (24 * 60))} д ${Math.floor((elapsedMinutes % (24 * 60)) / 60)} ч`;
  return `${Math.floor(elapsedMinutes / (24 * 60))} дней`;
}

const performanceLabels = { fast: 'Быстро', normal: 'Нормально', slow: 'Завис' } as const;

function isTelegramPostUrl(value: string) {
  return /^https:\/\/t\.me\/rent_tbilisi_ge\/\d+$/.test(value);
}

function pluralizeReposts(value: number) {
  const mod100 = Math.abs(value) % 100;
  const mod10 = Math.abs(value) % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'репостов';
  if (mod10 === 1) return 'репост';
  if (mod10 >= 2 && mod10 <= 4) return 'репоста';
  return 'репостов';
}

export function useTelegramTop() {
  const [payload, setPayload] = useState<TelegramPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${TELEGRAM_DATA_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const nextPayload = (await response.json()) as TelegramPayload;
      setPayload(nextPayload);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const items = useMemo(() => (Array.isArray(payload?.items) ? payload.items : [])
    .filter((item) => item && typeof item.id === 'string' && isTelegramPostUrl(item.post_url))
    .map((item) => ({ ...item, repostCount: Number(item.repostCount ?? item.daily_reposts) }))
    .filter((item) => Number.isFinite(item.repostCount) && item.repostCount > 0)
    .sort((left, right) => right.repostCount - left.repostCount)
    .slice(0, 10), [payload]);

  const recentlyRented = useMemo(() => (Array.isArray(payload?.recentlyRented) ? payload.recentlyRented : [])
    .filter((item) => ['rented', 'sold'].includes(item?.lifecycleStatus ?? '') && typeof item.post_url === 'string' && isTelegramPostUrl(item.post_url))
    .slice(0, 5), [payload]);

  return { error, items, loading, recentlyRented, reload };
}

type TelegramTopProps = ReturnType<typeof useTelegramTop>;

export function TelegramTop({ error, items, loading, reload }: TelegramTopProps) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <section className="telegramTop uiCard">
      <SectionHeader
        eyebrow="Telegram-аналитика"
        title="Топ объектов по репостам"
        description="Актуальные данные опубликованных Telegram-постов"
        actions={<button className="secondaryButton compactButton" onClick={() => void reload()} type="button">Обновить</button>}
      />
      {loading ? <LoadingState label="Загружаем Telegram-рейтинг…" /> : error ? (
        <EmptyStateCard title="Данные по репостам пока не загружены" text={error} />
      ) : items.length === 0 ? (
        <EmptyStateCard title="Рейтинг репостов пока пуст" text="Данные появятся после следующего обновления рейтинга." />
      ) : (
        <div className="telegramCardGrid">
          {items.map((item, index) => (
            <article className="telegramPropertyCard" data-lifecycle-status="active" data-telegram-id={item.id} key={item.id}>
              <div className="telegramMedia">
                {item.image ? <img alt={item.title || 'Объект из Telegram'} src={new URL(item.image, TELEGRAM_ASSET_BASE_URL).toString()} /> : <MessageCircle size={30} />}
                <span className="rankBadge">№{index + 1}</span>
                <span className="repostBadge">↗ {item.repostCount} {pluralizeReposts(item.repostCount)}</span>
                <div className="lifecycleBadgeRow">
                  {item.firstSeenAt && (
                    <span className={`channelAgeBadge ${index < 3 ? 'channelAgeBadgeFeatured' : 'channelAgeBadgeNeutral'}`}>
                      {channelLabel(item.firstSeenAt, now)}
                    </span>
                  )}
                  {item.performanceStatus && <span className={`performanceBadge performanceBadge-${item.performanceStatus}`}>{performanceLabels[item.performanceStatus]}</span>}
                </div>
              </div>
              <div className="telegramCardBody">
                {item.price !== null && <div className="telegramPrice">${item.price.toLocaleString('en-US')}</div>}
                {item.title && <h3>{item.title}</h3>}
                {(item.area !== null || item.rooms !== null || item.district) && (
                  <p>{[item.area !== null ? `${item.area} м²` : '', item.rooms !== null ? `${item.rooms} спальни` : '', item.district].filter(Boolean).join(' · ')}</p>
                )}
                {(item.metro || item.floor) && <p>{[item.metro ? `Метро: ${item.metro}` : '', item.floor ? `Этаж: ${item.floor}` : ''].filter(Boolean).join(' · ')}</p>}
                <p className="lifecycleStatusText">Статус: Активен</p>
                <div className="lifecycleMetrics">
                  <span>Лучшее место: №{item.highestRank ?? index + 1}</span>
                  <span>Максимум репостов: {item.maxRepostCount ?? item.repostCount}</span>
                </div>
                <a className="telegram-post-link" href={item.post_url} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>
                  Открыть пост <ExternalLink size={15} />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function RecentlyRented({ items }: { items: TelegramItem[] }) {
  return (
    <section className="recentlyRented uiCard">
      <SectionHeader eyebrow="Lifecycle" title="Недавно закрыты" description="Только объекты с подтверждённой арендой или продажей" />
      {items.length === 0 ? (
        <EmptyStateCard title="Подтверждённых сделок пока нет" text="Объекты появятся здесь после подтверждения аренды или продажи в Telegram или CRM." />
      ) : (
        <div className="telegramCardGrid rentedCardGrid">
          {items.map((item) => (
            <article className="telegramPropertyCard rentedPropertyCard" data-lifecycle-status={item.lifecycleStatus} data-telegram-id={item.id} key={item.propertyKey ?? item.id}>
              <div className="telegramMedia">
                {item.image ? <img alt={item.title || 'Сданный объект'} src={new URL(item.image, TELEGRAM_ASSET_BASE_URL).toString()} /> : <MessageCircle size={30} />}
                <span className="rentedBadge">{item.lifecycleStatus === 'sold' ? 'ПРОДАНО' : 'СДАНО'}</span>
              </div>
              <div className="telegramCardBody">
                {item.price !== null && <div className="telegramPrice">${item.price.toLocaleString('en-US')}</div>}
                {item.title && <h3>{item.title}</h3>}
                {item.district && <p>{item.district}</p>}
                {typeof item.daysUntilClosed === 'number' && (
                  <strong className="rentedDuration">
                    {item.lifecycleStatus === 'sold' ? 'Продано' : 'Сдано'} за {item.daysUntilClosed} {dayWord(item.daysUntilClosed)}
                  </strong>
                )}
                {item.performanceStatus && <span className={`performanceBadge performanceBadge-${item.performanceStatus}`}>{performanceLabels[item.performanceStatus]}</span>}
                <div className="lifecycleMetrics">
                  <span>Лучшее место: №{item.highestRank}</span>
                  <span>Максимум репостов: {item.maxRepostCount}</span>
                </div>
                <a className="telegram-post-link" href={item.post_url} target="_blank" rel="noopener noreferrer">Открыть исходный пост <ExternalLink size={15} /></a>
                {item.confirmationTelegramUrl && <a className="telegram-post-link" href={item.confirmationTelegramUrl} target="_blank" rel="noopener noreferrer">Открыть подтверждение <ExternalLink size={15} /></a>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
