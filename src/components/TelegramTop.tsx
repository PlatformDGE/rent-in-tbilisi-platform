import { ExternalLink, MessageCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { EmptyStateCard, LoadingState, SectionHeader } from './ui';

const TELEGRAM_DATA_URL = 'https://platformdge.github.io/-rentintbilisi-crm/telegram-top10.json';
const TELEGRAM_ASSET_BASE = 'https://platformdge.github.io/-rentintbilisi-crm/';

type TelegramItem = {
  id: string;
  title: string;
  price: number | null;
  area: number | null;
  district: string;
  metro: string;
  rooms: number | null;
  floor: string;
  daily_reposts: number;
  current_forwards: number;
  published_at: string;
  post_url: string;
  image: string;
};

type TelegramPayload = {
  status: string;
  test_mode?: boolean;
  baseline_created_late?: boolean;
  updated_at: string;
  items: TelegramItem[];
};

function pluralizeReposts(value: number) {
  const mod100 = Math.abs(value) % 100;
  const mod10 = Math.abs(value) % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'репостов';
  if (mod10 === 1) return 'репост';
  if (mod10 >= 2 && mod10 <= 4) return 'репоста';
  return 'репостов';
}

export function TelegramTop({ onTotalChange }: { onTotalChange?: (total: number) => void }) {
  const [payload, setPayload] = useState<TelegramPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${TELEGRAM_DATA_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setPayload((await response.json()) as TelegramPayload);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const items = useMemo(() => [...(payload?.items || [])].sort((a, b) => {
    const repostDifference = Number(b.daily_reposts || 0) - Number(a.daily_reposts || 0);
    if (repostDifference) return repostDifference;
    const forwardsDifference = Number(b.current_forwards || 0) - Number(a.current_forwards || 0);
    if (forwardsDifference) return forwardsDifference;
    return String(b.published_at || '').localeCompare(String(a.published_at || ''));
  }).slice(0, 10), [payload]);

  const total = items.reduce((sum, item) => sum + Number(item.daily_reposts || 0), 0);
  useEffect(() => { onTotalChange?.(total); }, [onTotalChange, total]);
  const isTest = payload?.status === 'test' || payload?.test_mode === true;

  return (
    <section className="telegramTop uiCard">
      <SectionHeader
        eyebrow="Telegram-аналитика"
        title={isTest ? 'Тестовый топ-10 по репостам' : 'Топ-10 объектов по репостам'}
        description={isTest ? 'Тестовый режим: показано текущее общее количество репостов' : 'Текущий период 10:00–22:00 · Asia/Tbilisi'}
        actions={<button className="secondaryButton compactButton" onClick={() => void load()} type="button">Обновить</button>}
      />
      {isTest && <span className="telegramTestBadge">ТЕСТ</span>}
      {loading ? <LoadingState label="Загружаем Telegram-рейтинг…" /> : error ? (
        <EmptyStateCard title="Не удалось загрузить рейтинг" text={error} />
      ) : items.length === 0 ? (
        <EmptyStateCard title="Рейтинг пока пуст" text="После обновления Telegram данные появятся здесь." />
      ) : (
        <div className="telegramCardGrid">
          {items.map((item, index) => (
            <article className="telegramPropertyCard" key={item.id}>
              <div className="telegramMedia">
                {item.image ? <img alt={item.title} src={new URL(item.image, TELEGRAM_ASSET_BASE).toString()} /> : <MessageCircle size={30} />}
                <span className="rankBadge">№{index + 1}</span>
                <span className="repostBadge">↗ {item.daily_reposts} {pluralizeReposts(item.daily_reposts)}</span>
              </div>
              <div className="telegramCardBody">
                <div className="telegramPrice">{item.price ? `$${item.price.toLocaleString('en-US')}` : 'Цена не указана'}</div>
                <h3>{item.title}</h3>
                <p>{[item.area ? `${item.area} м²` : '', item.rooms ? `${item.rooms} спальни` : '', item.district].filter(Boolean).join(' · ')}</p>
                <p>{[item.metro ? `Метро: ${item.metro}` : '', item.floor ? `Этаж: ${item.floor}` : ''].filter(Boolean).join(' · ')}</p>
                <a className="telegramLink" href={item.post_url} target="_blank" rel="noopener noreferrer">Открыть пост <ExternalLink size={15} /></a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
