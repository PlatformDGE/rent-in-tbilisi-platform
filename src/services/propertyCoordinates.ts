import type { Property } from '../domain/types';

export type Coordinates = { latitude: number; longitude: number };

function valid(latitude: number, longitude: number) {
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

export function extractCoordinatesFromMapLink(mapLink: string): Coordinates | null {
  if (!mapLink) return null;
  try {
    const url = new URL(mapLink);
    const query = url.searchParams.get('q');
    const source = query || url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)?.slice(1).join(',') || '';
    const match = source.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
    if (!match) return null;
    const latitude = Number(match[1]);
    const longitude = Number(match[2]);
    return valid(latitude, longitude) ? { latitude, longitude } : null;
  } catch {
    return null;
  }
}

export function getPropertyCoordinates(property: Pick<Property, 'latitude' | 'longitude' | 'mapLink'>): Coordinates | null {
  const latitude = typeof property.latitude === 'number' ? property.latitude : Number.NaN;
  const longitude = typeof property.longitude === 'number' ? property.longitude : Number.NaN;
  if (valid(latitude, longitude)) return { latitude, longitude };
  return extractCoordinatesFromMapLink(property.mapLink);
}
