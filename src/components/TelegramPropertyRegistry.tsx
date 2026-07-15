import { ExternalLink, ImageOff, MapPin } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { TelegramRegistryPayload, TelegramRegistryProperty } from '../domain/telegramRegistry';
import { TELEGRAM_ASSET_BASE_URL } from '../config/runtime';
import { httpTelegramRegistryRepository } from '../repositories/telegramRegistryRepository';
import { enforceRegistryAccess, type RegistryPrincipal } from '../services/telegramRegistryPolicy';
import { formatRegistryChannelAge, getPrimaryRegistryMedia } from '../services/telegramRegistryService';
import { EmptyStateCard, LoadingState, SectionHeader } from './ui';

export function useTelegramRegistry(principal: RegistryPrincipal) {
  const [payload, setPayload] = useState<TelegramRegistryPayload | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    httpTelegramRegistryRepository.load(controller.signal)
      .then(setPayload)
      .catch((reason) => { if (reason?.name !== 'AbortError') setError(reason instanceof Error ? reason.message : 'Ошибка загрузки'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);
  const properties = useMemo(() => enforceRegistryAccess(principal, payload?.properties ?? []), [payload, principal]);
  return { agents: payload?.agents ?? [], error, loading, payload, properties };
}

export function RegistryDashboardMetrics({ payload }: { payload: TelegramRegistryPayload | null }) {
  if (!payload) return null;
  const today = new Date().toISOString().slice(0, 10);
  const items = [
    ['Активные объекты', payload.properties.filter((item) => item.lifecycleStatus === 'active').length],
    ['Новые сегодня', payload.properties.filter((item) => item.publishedAt.slice(0, 10) === today).length],
    ['Без агента', payload.properties.filter((item) => !item.assignedAgentId).length],
    ['Без координат', payload.properties.filter((item) => !item.coordinates).length],
  ];
  return <section className="registryMetricGrid">{items.map(([label, value]) => <article className="metricCard" key={label}><span>{label}</span><strong>{value}</strong></article>)}</section>;
}

export function TelegramPropertyRegistry({ principal }: { principal: RegistryPrincipal }) {
  const registry = useTelegramRegistry(principal);
  const [district, setDistrict] = useState('Все районы');
  const [agent, setAgent] = useState('Все агенты');
  const [status, setStatus] = useState('Все статусы');
  const [special, setSpecial] = useState('Все объекты');
  const districts = [...new Set(registry.properties.map((item) => item.district).filter(Boolean))].sort();
  const filtered = registry.properties.filter((item) => {
    if (district !== 'Все районы' && item.district !== district) return false;
    if (agent !== 'Все агенты' && item.assignedAgentId !== agent) return false;
    if (status !== 'Все статусы' && item.lifecycleStatus !== status) return false;
    if (special === 'Есть репосты' && item.repostCount <= 0) return false;
    if (special === 'Без репостов' && item.repostCount > 0) return false;
    if (special === 'Нет координат' && item.coordinates) return false;
    if (special === 'Не определён агент' && item.assignedAgentId) return false;
    return true;
  });

  return (
    <section className="workspace telegramRegistry">
      <SectionHeader eyebrow="Telegram Property Registry" title="Объекты основного канала" description="Все активные публикации независимо от количества репостов" />
      {registry.loading ? <LoadingState label="Импортируем реестр Telegram…" /> : registry.error ? <EmptyStateCard title="Реестр не загружен" text={registry.error} /> : (
        <>
          <div className="registryFilters">
            <label>Район<select value={district} onChange={(event) => setDistrict(event.target.value)}><option>Все районы</option>{districts.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label>Агент<select value={agent} onChange={(event) => setAgent(event.target.value)}><option>Все агенты</option>{registry.agents.map((value) => <option key={value.id} value={value.id}>#{value.agentHashtag}</option>)}</select></label>
            <label>Статус<select value={status} onChange={(event) => setStatus(event.target.value)}><option>Все статусы</option><option value="active">Активные</option><option value="rented">Сданные</option><option value="sold">Проданные</option><option value="removed">Удалённые</option></select></label>
            <label>Фильтр<select value={special} onChange={(event) => setSpecial(event.target.value)}>{['Все объекты', 'Есть репосты', 'Без репостов', 'Нет координат', 'Не определён агент'].map((value) => <option key={value}>{value}</option>)}</select></label>
          </div>
          <p className="registrySummary">Показано {filtered.length} из {registry.properties.length}. С фото: {registry.payload?.report.withRealMedia ?? 0}. Без агента: {registry.payload?.report.unassignedAgents ?? 0}.</p>
          <div className="registryGrid">
            {filtered.map((property) => {
              const media = getPrimaryRegistryMedia(property);
              return <article className="registryCard" key={property.id}>
                <div className="registryMedia">{media ? <img alt={property.address} src={new URL(media.thumbnailUrl, TELEGRAM_ASSET_BASE_URL).toString()} /> : <><ImageOff /><small>{property.mediaImportStatus}</small></>}</div>
                <div className="registryCardBody">
                  <strong>{property.price ? `${property.price.toLocaleString('en-US')} ${property.currency}` : 'Цена не указана'}</strong>
                  <h3>{property.address}</h3>
                  <p>{[property.district, property.area ? `${property.area} м²` : '', property.bedrooms !== null ? `${property.bedrooms} спальни` : ''].filter(Boolean).join(' · ')}</p>
                  <p>Агент: {property.agentHashtag ? `#${property.agentHashtag}` : 'Не определён'}</p>
                  <p>На канале: {formatRegistryChannelAge(property.channelAgeMinutes)}</p>
                  <div className="registryBadges"><span>{property.lifecycleStatus}</span><span>↗ {property.repostCount}</span><span><MapPin size={12} /> {property.coordinates ? 'Есть координаты' : 'Нет координат'}</span></div>
                  <a className="telegram-post-link" href={property.sourceTelegramUrl} target="_blank" rel="noopener noreferrer">Открыть Telegram <ExternalLink size={14} /></a>
                </div>
              </article>;
            })}
          </div>
          {filtered.length === 0 && <EmptyStateCard title="Объекты не найдены" text="Измените фильтры реестра." />}
        </>
      )}
    </section>
  );
}
