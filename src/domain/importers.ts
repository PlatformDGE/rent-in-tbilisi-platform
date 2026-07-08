import {
  buildingTypes,
  defaultBrandSettings,
  districtOptions,
  emptyProperty,
  heatingOptions,
  metroOptions,
  renovationTypes,
} from './constants';
import { pricePerM2 } from './formatters';
import { normalizeCategoryValue, normalizeCity, normalizeDealType, normalizeDistrictValue, normalizeMetroValue, normalizeStatusValue } from './normalizers';
import { buildTelegramPost, districtTags, metroTags } from './telegram';
import type { Category, DealType, PetPolicy, Property, PropertyFormState, PropertyPhoto } from './types';

export function parseTelegramPostToProperty(text: string): PropertyFormState {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const hasTag = (tag: string) => new RegExp(`${tag}(?![A-Za-z0-9_])`).test(text);
  const district =
    districtOptions.find((option) => {
      const tag = districtTags[option];
      return tag ? hasTag(tag) : false;
    }) || '';
  const metro =
    metroOptions.find((option) => {
      const tag = metroTags[option];
      return tag ? hasTag(tag) : false;
    }) || '';
  const addressLine = lines.find((line) => line.startsWith('📍') && !line.includes('APARTMENTS ON MAP'));
  const bedroomMatch = text.match(/#([1-4])Bed/i);
  const areaMatch = text.match(/(\d+(?:\.\d+)?)\s*sq\.?m/i);
  const floorMatch = text.match(/(\d+)\s*\/\s*(\d+)\s*Floor/i);
  const tenantsMatch = text.match(/Tenants:\s*([^\n]+)/i);
  const moneyMatch = text.match(/💰\s*(\d+(?:\.\d+)?)/);
  const depositMatch = text.match(/Deposit\s*(\d+(?:\.\d+)?)/i);
  const contactMatch = text.match(/(@[A-Za-z0-9_]+)/);
  const phoneMatch = text.match(/\+995\s*\d{3}\s*\d{2}\s*\d{2}\s*\d{2}/);
  const category: Category = hasTag('#House') ? 'House' : hasTag('#Commercial') ? 'Commercial' : 'Apartment';
  const dealType: DealType = hasTag('#Sale') ? 'Sale' : hasTag('#DailyRent') ? 'Daily Rent' : 'Rent';
  const buildingType = buildingTypes.find((item) => hasTag(`#${item}`)) || 'NewBuilding';
  const renovation = renovationTypes.find((item) => hasTag(`#${item}`)) || 'White';
  const heating = heatingOptions.find((item) => hasTag(`#${item}`)) || 'CentralHeating';
  const petPolicy: PetPolicy = hasTag('#Allowed') ? 'Allowed' : hasTag('#NotAllowed') ? 'NotAllowed' : 'ByAgreement';

  return {
    ...emptyProperty,
    dealType,
    category,
    city: 'Tbilisi',
    district,
    metro,
    address: addressLine ? addressLine.replace(/^📍\s*/, '') : '',
    source: 'Telegram',
    titleRu: '',
    titleEn: '',
    price: moneyMatch?.[1] || '',
    area: areaMatch?.[1] || '',
    bedrooms: bedroomMatch?.[1] || '',
    rooms: bedroomMatch?.[1] ? String(Number(bedroomMatch[1]) + 1) : '',
    floor: floorMatch?.[1] || '',
    totalFloors: floorMatch?.[2] || '',
    tenantsCount: tenantsMatch?.[1]?.trim() || '',
    buildingType,
    renovation,
    heating,
    airConditioner: hasTag('#Conditioner'),
    balcony: hasTag('#Balcony'),
    elevator: hasTag('#Elevator'),
    parking: hasTag('#ParkingPlace'),
    oven: hasTag('#Oven'),
    stove: hasTag('#Stove'),
    tv: hasTag('#TV'),
    vacuumCleaner: hasTag('#VacuumCleaner'),
    shower: hasTag('#Shower'),
    internet: hasTag('#WiFi'),
    petPolicy,
    deposit: depositMatch?.[1] || '',
    publicationContact: contactMatch?.[1] || emptyProperty.publicationContact,
    ownerPhone: phoneMatch?.[0] || '',
    exclusive: hasTag('#Exclusive'),
    internalNotes: 'Imported from Telegram post',
  };
}

export function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells.map((cell) => cell.replace(/^"|"$/g, ''));
}

export function parseCsvProperties(csv: string): PropertyFormState[] {
  const rows = csv
    .split('\n')
    .map((row) => row.trim())
    .filter(Boolean);
  if (rows.length < 2) return [];
  const headers = splitCsvLine(rows[0]).map((header) => header.trim().toLowerCase());
  return rows.slice(1).map((row) => {
    const cells = splitCsvLine(row);
    const get = (...names: string[]) => {
      const index = headers.findIndex((header) => names.includes(header));
      return index >= 0 ? cells[index] || '' : '';
    };
    const photoUrl = get('photo', 'photo_url', 'photourl', 'image');
    const photo: PropertyPhoto | undefined = photoUrl
      ? { id: crypto.randomUUID(), name: 'CSV photo', src: photoUrl, type: 'url' }
      : undefined;
    return {
      ...emptyProperty,
      dealType: normalizeDealType(get('dealtype', 'deal_type', 'type')),
      category: normalizeCategoryValue(get('category')) as Category,
      city: normalizeCity(get('city')),
      district: normalizeDistrictValue(get('district', 'area')),
      metro: normalizeMetroValue(get('metro')),
      address: get('address'),
      source: 'Google Sheets',
      price: get('price'),
      area: get('area', 'sqm', 'sq.m'),
      bedrooms: get('bedrooms', 'bed'),
      rooms: get('rooms'),
      floor: get('floor'),
      totalFloors: get('totalfloors', 'total_floors'),
      status: normalizeStatusValue(get('status')),
      agent: get('agent') || emptyProperty.agent,
      owner: get('owner'),
      ownerPhone: get('ownerphone', 'owner_phone', 'phone'),
      ownerTelegram: get('ownertelegram', 'owner_telegram', 'telegram'),
      photos: photo ? [photo] : [],
      mainPhotoId: photo?.id || '',
      internalNotes: 'Imported from CSV',
    };
  });
}

export function getImportPreviewHashtags(property: Property) {
  return buildTelegramPost(property, defaultBrandSettings, 'EN');
}

export { pricePerM2 };
