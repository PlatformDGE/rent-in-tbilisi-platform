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
};

type TelegramPayload = {
  status: string;
  updated_at: string;
  items: TelegramItem[];
};

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

  return { error, items, loading, reload };
}

type TelegramTopProps = ReturnType<typeof useTelegramTop>;

export function TelegramTop({ error, items, loading, reload }: TelegramTopProps) {
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
            <article className="telegramPropertyCard" data-telegram-id={item.id} key={item.id}>
              <div className="telegramMedia">
                {item.image ? <img alt={item.title || 'Объект из Telegram'} src={new URL(item.image, TELEGRAM_ASSET_BASE_URL).toString()} /> : <MessageCircle size={30} />}
                <span className="rankBadge">№{index + 1}</span>
                <span className="repostBadge">↗ {item.repostCount} {pluralizeReposts(item.repostCount)}</span>
              </div>
              <div className="telegramCardBody">
                {item.price !== null && <div className="telegramPrice">${item.price.toLocaleString('en-US')}</div>}
                {item.title && <h3>{item.title}</h3>}
                {(item.area !== null || item.rooms !== null || item.district) && (
                  <p>{[item.area !== null ? `${item.area} м²` : '', item.rooms !== null ? `${item.rooms} спальни` : '', item.district].filter(Boolean).join(' · ')}</p>
                )}
                {(item.metro || item.floor) && <p>{[item.metro ? `Метро: ${item.metro}` : '', item.floor ? `Этаж: ${item.floor}` : ''].filter(Boolean).join(' · ')}</p>}
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
