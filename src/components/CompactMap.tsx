import { divIcon } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Link } from 'react-router-dom';

import type { Property } from '../domain/types';
import { formatPrice, getMainPhoto, statusClassName } from '../domain/formatters';
import { getPropertyCoordinates } from '../services/propertyCoordinates';
import { EmptyStateCard, SectionHeader } from './ui';

type RepostLookup = Record<string, number>;

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] || character);
}

export function CompactMap({ properties, reposts = {} }: { properties: Property[]; reposts?: RepostLookup }) {
  const mapped = properties.flatMap((property) => {
    const coordinates = getPropertyCoordinates(property);
    return coordinates ? [{ property, coordinates }] : [];
  });

  return (
    <section className="mapCard uiCard">
      <SectionHeader eyebrow="Карта объектов" title="Локации" description={`${mapped.length} объектов с координатами`} />
      {mapped.length ? (
        <MapContainer center={[41.7151, 44.8271]} zoom={12} scrollWheelZoom={false} className="compactMap" aria-label="Карта объектов">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {mapped.map(({ property, coordinates }, index) => {
            const photo = getMainPhoto(property);
            const marker = divIcon({
              className: 'propertyDivIcon',
              html: `<span>${escapeHtml(property.price ? `${property.currency}${property.price}` : String(index + 1))}</span>`,
              iconSize: [58, 30],
              iconAnchor: [29, 30],
            });
            return (
              <Marker icon={marker} key={property.id} position={[coordinates.latitude, coordinates.longitude]}>
                <Popup className="propertyPopup" minWidth={230}>
                  <div className="mapPopupCard">
                    {photo && <img alt="" src={photo.src} />}
                    <span className={statusClassName(property.status)}>{property.status}</span>
                    <strong>{property.titleRu || property.address}</strong>
                    <small>{property.address} · {property.district}</small>
                    <div>{formatPrice(property)} · {property.area || '—'} м²</div>
                    {reposts[property.id] !== undefined && <b>↗ {reposts[property.id]} репостов</b>}
                    <Link to={`/properties/${property.id}`}>Открыть объект</Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      ) : (
        <EmptyStateCard title="На карте пока нет объектов" text="Добавьте координаты объектам, чтобы увидеть их на карте" />
      )}
    </section>
  );
}
