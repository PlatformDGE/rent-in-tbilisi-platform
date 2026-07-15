import { divIcon } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

import type { TelegramItem } from './TelegramTop';
import { EmptyStateCard, SectionHeader } from './ui';
import { TELEGRAM_ASSET_BASE_URL } from '../config/runtime';

const performanceLabels = { fast: 'Быстро', normal: 'Нормально', slow: 'Завис' } as const;

function hasCoordinates(item: TelegramItem) {
  return typeof item.latitude === 'number' && Number.isFinite(item.latitude)
    && item.latitude >= -90 && item.latitude <= 90
    && typeof item.longitude === 'number' && Number.isFinite(item.longitude)
    && item.longitude >= -180 && item.longitude <= 180;
}

export function CompactMap({ items }: { items: TelegramItem[] }) {
  const mapped = items.filter(hasCoordinates);

  return (
    <section className="mapCard uiCard">
      <SectionHeader eyebrow="Карта" title="Карта объектов по репостам" description="Объекты из текущего Telegram-топа" />
      {mapped.length ? (
        <MapContainer center={[41.7151, 44.8271]} zoom={12} scrollWheelZoom={false} className="compactMap" aria-label="Карта объектов по репостам">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {mapped.map((item) => {
            const rank = items.findIndex((candidate) => candidate.id === item.id) + 1;
            const marker = divIcon({
              className: 'propertyDivIcon',
              html: `<span>№${rank}</span>`,
              iconSize: [42, 30],
              iconAnchor: [21, 30],
            });
            return (
              <Marker icon={marker} key={item.id} position={[item.latitude as number, item.longitude as number]}>
                <Popup className="propertyPopup" minWidth={230}>
                  <div className="mapPopupCard" data-telegram-id={item.id}>
                    <b>№{rank}</b>
                    {item.image && <img alt={item.title || 'Объект из Telegram'} src={new URL(item.image, TELEGRAM_ASSET_BASE_URL).toString()} />}
                    {item.title && <strong>{item.title}</strong>}
                    {item.price !== null && <div>${item.price.toLocaleString('en-US')}</div>}
                    {(item.area !== null || item.district || item.rooms !== null) && <small>{[item.area !== null ? `${item.area} м²` : '', item.district, item.rooms !== null ? `${item.rooms} спальни` : ''].filter(Boolean).join(' · ')}</small>}
                    {(item.metro || item.floor) && <small>{[item.metro ? `Метро: ${item.metro}` : '', item.floor ? `Этаж: ${item.floor}` : ''].filter(Boolean).join(' · ')}</small>}
                    <b>↗ {item.repostCount} репостов</b>
                    {item.timerLabel && <small>На канале: {item.timerLabel}</small>}
                    {item.performanceStatus && <small>Статус: {performanceLabels[item.performanceStatus]}</small>}
                    <small>Лучшее место: №{item.highestRank ?? rank}</small>
                    <small>Максимум репостов: {item.maxRepostCount ?? item.repostCount}</small>
                    <a className="telegram-post-link" href={item.post_url} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>Открыть пост</a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      ) : (
        <EmptyStateCard title="Нет объектов с координатами" text="Объекты появятся на карте после добавления подтверждённых координат в Telegram-рейтинг." />
      )}
      <p className="mapCoverage">На карте отображается {mapped.length} из {items.length} объектов с репостами</p>
    </section>
  );
}
