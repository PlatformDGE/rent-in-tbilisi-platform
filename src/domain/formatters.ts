import type { Property, PropertyStatus, PublicationStatus } from './types';

export function safeNumber(value: string) {
  return Number(value.replace(/[^\d.]/g, '')) || 0;
}

export function pricePerM2(property: Pick<Property, 'area' | 'price'>) {
  const area = safeNumber(property.area);
  const price = safeNumber(property.price);
  return area > 0 && price > 0 ? Math.round(price / area) : 0;
}

export function getMainPhoto(property: Property) {
  return property.photos.find((photo) => photo.id === property.mainPhotoId) || property.photos[0];
}

export function statusClassName(status: PropertyStatus) {
  return `status status-${status.toLowerCase().replace(/\s+/g, '-')}`;
}

export function formatPrice(property: Property) {
  return property.price ? `${property.price}${property.currency}` : 'Цена по запросу';
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function extractHashtags(text: string) {
  return Array.from(new Set(text.match(/#[A-Za-z0-9]+/g) || [])).join(' ');
}

export function publicationStatusClassName(status: PublicationStatus) {
  return `status status-${status.toLowerCase().replace(/\s+/g, '-')}`;
}
