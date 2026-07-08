import {
  buildingTypes,
  categories,
  cities,
  currencies,
  defaultBrandSettings,
  districtOptions,
  emptyProperty,
  metroOptions,
  petPolicies,
  propertyStatuses,
  renovationTypes,
  sourceOptions,
} from './constants';
import type {
  Agent,
  BrandSettings,
  Category,
  Currency,
  DealType,
  PetPolicy,
  Property,
  PropertyPhoto,
  PropertyStatus,
  PropertyVideo,
  Publication,
  PublicationStatus,
  RenovationType,
  BuildingType,
  TeamRole,
} from './types';
import { teamRoles } from './constants';

export function normalizeBoolean(value: unknown) {
  return value === true || value === 'true' || value === 'Да' || value === 'Allowed';
}

export function normalizeDealType(value: unknown): DealType {
  if (value === 'Rent' || value === 'Аренда') return 'Rent';
  if (value === 'Sale' || value === 'Продажа') return 'Sale';
  if (value === 'Daily Rent') return 'Daily Rent';
  return 'Rent';
}

export function normalizeCategoryValue(value: unknown): Category {
  const map: Record<string, Category> = {
    Apartment: 'Apartment',
    House: 'House',
    Commercial: 'Commercial',
    Land: 'Land',
    Office: 'Office',
    Hotel: 'Hotel',
    Квартира: 'Apartment',
    Дом: 'House',
    Коммерция: 'Commercial',
    Земля: 'Land',
    Офис: 'Office',
    Отель: 'Hotel',
  };
  const category = map[String(value)] || 'Apartment';
  return categories.includes(category) ? category : 'Apartment';
}

export function normalizeStatusValue(value: unknown): PropertyStatus {
  const map: Record<string, PropertyStatus> = {
    New: 'New',
    'In Progress': 'In Progress',
    'On Advertising': 'On Advertising',
    Reserved: 'Reserved',
    Rented: 'Rented',
    Sold: 'Sold',
    Archived: 'Archived',
    Новый: 'New',
    'В работе': 'In Progress',
    'На рекламе': 'On Advertising',
    Сдан: 'Rented',
    Продан: 'Sold',
    Архив: 'Archived',
  };
  const status = map[String(value)] || 'New';
  return propertyStatuses.includes(status) ? status : 'New';
}

export function normalizePetPolicy(value: unknown): PetPolicy {
  const map: Record<string, PetPolicy> = {
    Allowed: 'Allowed',
    NotAllowed: 'NotAllowed',
    ByAgreement: 'ByAgreement',
    Да: 'Allowed',
    Нет: 'NotAllowed',
    Обсуждается: 'ByAgreement',
  };
  const policy = map[String(value)] || 'ByAgreement';
  return petPolicies.includes(policy) ? policy : 'ByAgreement';
}

export function normalizeCity(value: unknown) {
  const city = String(value || 'Tbilisi');
  return cities.includes(city) ? city : 'Other';
}

export function normalizeDistrictValue(value: unknown) {
  const map: Record<string, string> = {
    'Savnetis Ubani': 'SavnetisUbani',
    'Vazha Pshavela': 'VazhaPshavela',
    'Didi Digomi': 'DidiDigomi',
    'Digomi Massive': 'DigomiMassive',
    'Old Tbilisi': 'Avlabari',
    'Qvemo Ponichala': 'QvemoPonichala',
    Tskhneti: 'Tskhneti',
    Tskneti: 'Tskneti',
  };
  const district = map[String(value)] || String(value || '');
  return districtOptions.includes(district) ? district : 'OutOfTown';
}

export function normalizeMetroValue(value: unknown) {
  const map: Record<string, string> = {
    'Liberty Square': 'LibertySquare',
    'Station Square': 'StationSquare',
    'Ahmeteli Theatre': 'AhmeteliTheatre',
    'Vazha Pshavela': 'VazhaPshavela',
    'Medical University': 'MCUniversity',
    '300 Aragveli': '300Aragveli',
  };
  const metro = map[String(value)] || String(value || '');
  return metroOptions.includes(metro) ? metro : '';
}

export function normalizeSource(value: unknown) {
  const source = String(value || 'Owner');
  return sourceOptions.includes(source) ? source : 'Other';
}

export function mergeById<T extends { id: string }>(saved: T[], seeds: T[]) {
  const ids = new Set(saved.map((item) => item.id));
  return [...saved, ...seeds.filter((item) => !ids.has(item.id))];
}

export function normalizeProperty(property: Partial<Property> & Record<string, unknown>, index: number): Property {
  const legacyPhoto = typeof property.photoUrl === 'string' && property.photoUrl ? property.photoUrl : '';
  const photos = Array.isArray(property.photos)
    ? (property.photos as PropertyPhoto[])
    : legacyPhoto
      ? [{ id: `legacy-photo-${index}`, name: 'Legacy photo', src: legacyPhoto, type: 'url' as const }]
      : [];
  const area = String(property.area || '').replace('м2', '').replace('m2', '').trim();
  const price = String(property.price || '').replace('$', '').replace('₾', '').replace('€', '').trim();
  const floorParts = String(property.floor || '').split('/');
  return {
    ...emptyProperty,
    id: String(property.id || `RIT-${1000 + index}`),
    createdAt: String(property.createdAt || new Date().toISOString()),
    updatedAt: String(property.updatedAt || property.createdAt || new Date().toISOString()),
    dealType: normalizeDealType(property.dealType),
    category: normalizeCategoryValue(property.category),
    city: normalizeCity(property.city),
    district: normalizeDistrictValue(property.district),
    metro: normalizeMetroValue(property.metro),
    address: String(property.address || ''),
    mapLink: String(property.mapLink || ''),
    cadastralCode: String(property.cadastralCode || ''),
    building: String(property.building || ''),
    source: normalizeSource(property.source),
    titleRu: String(property.titleRu || property.address || ''),
    titleEn: String(property.titleEn || property.address || ''),
    descriptionRu: String(property.descriptionRu || property.notes || property.internalNotes || ''),
    descriptionEn: String(property.descriptionEn || ''),
    price,
    currency: currencies.includes(property.currency as Currency) ? (property.currency as Currency) : '$',
    area,
    bedrooms: String(property.bedrooms || ''),
    rooms: String(property.rooms || ''),
    floor: String(floorParts[0] || ''),
    totalFloors: String(property.totalFloors || floorParts[1] || ''),
    tenantsCount: String(property.tenantsCount || '1-4'),
    buildingType: buildingTypes.includes(property.buildingType as BuildingType)
      ? (property.buildingType as BuildingType)
      : 'NewBuilding',
    renovation: renovationTypes.includes(property.renovation as RenovationType)
      ? (property.renovation as RenovationType)
      : 'White',
    heating: String(property.heating || 'CentralHeating').replace(/\s+/g, ''),
    airConditioner: normalizeBoolean(property.airConditioner),
    balcony: normalizeBoolean(property.balcony),
    elevator: normalizeBoolean(property.elevator),
    parking: normalizeBoolean(property.parking),
    dishwasher: normalizeBoolean(property.dishwasher),
    oven: normalizeBoolean(property.oven),
    stove: property.stove === undefined ? true : normalizeBoolean(property.stove),
    tv: property.tv === undefined ? true : normalizeBoolean(property.tv),
    vacuumCleaner: property.vacuumCleaner === undefined ? true : normalizeBoolean(property.vacuumCleaner),
    shower: property.shower === undefined ? true : normalizeBoolean(property.shower),
    fridge: property.fridge === undefined ? true : normalizeBoolean(property.fridge),
    washingMachine: property.washingMachine === undefined ? true : normalizeBoolean(property.washingMachine),
    internet: property.internet === undefined ? true : normalizeBoolean(property.internet),
    petPolicy: normalizePetPolicy(property.petPolicy),
    rentalTerm: String(property.rentalTerm || '12Month'),
    deposit: String(property.deposit || ''),
    clientCommission: '0%',
    ownerCommission: String(property.ownerCommission || '50%'),
    taxIncluded: normalizeBoolean(property.taxIncluded),
    agent: String(property.agent || 'David Tibelashvili'),
    operator: String(property.operator || 'Mari'),
    publicationContact: String(property.publicationContact || '@David_Tibelashvili'),
    owner: String(property.owner || ''),
    ownerPhone: String(property.ownerPhone || ''),
    ownerTelegram: String(property.ownerTelegram || ''),
    status: normalizeStatusValue(property.status),
    exclusive: normalizeBoolean(property.exclusive),
    internalNotes: String(property.internalNotes || property.notes || ''),
    photos,
    mainPhotoId: String(property.mainPhotoId || photos[0]?.id || ''),
    videoUrl: String(property.videoUrl || ''),
    videoMeta: property.videoMeta && typeof property.videoMeta === 'object' ? (property.videoMeta as PropertyVideo) : null,
  };
}

export function normalizeAgent(agent: Partial<Agent>, index: number): Agent {
  return {
    id: agent.id || `agent-${index}`,
    name: agent.name || '',
    telegram: agent.telegram || '',
    phone: agent.phone || '',
    role: teamRoles.includes(agent.role as TeamRole) ? (agent.role as TeamRole) : 'Агент 50%',
    dealsCount: Number(agent.dealsCount || 0),
    exclusiveCount: Number(agent.exclusiveCount || 0),
    commissionPercent: Number(agent.commissionPercent || 0),
    isActive: agent.isActive !== false,
  };
}

export function normalizePublication(publication: Partial<Publication>, index: number): Publication {
  const statusMap: Record<string, PublicationStatus> = {
    Draft: 'Draft',
    Copied: 'Copied',
    'Test Published': 'Test Published',
    'Production Published': 'Production Published',
    Error: 'Error',
    черновик: 'Draft',
    скопировано: 'Copied',
    опубликовано: 'Test Published',
    ошибка: 'Error',
  };
  const channel = publication.channel === 'Test' || publication.channel === 'Production' ? publication.channel : 'Demo';
  return {
    id: publication.id || `pub-imported-${index}`,
    propertyId: publication.propertyId || '',
    propertyTitle: publication.propertyTitle || 'Untitled object',
    date: publication.date || new Date().toISOString(),
    author: publication.author || 'Demo user',
    channel,
    status: statusMap[String(publication.status)] || 'Draft',
    text: publication.text || '',
    photosCount: Number(publication.photosCount || 0),
    error: publication.error,
    messageLink: publication.messageLink,
  };
}

export function normalizeBrandSettings(settings: Partial<BrandSettings>) {
  const legacy = settings as Partial<BrandSettings> & Record<string, unknown>;
  const publishingMode =
    legacy.publishingMode === 'Demo' || legacy.publishingMode === 'Test' || legacy.publishingMode === 'Production'
      ? legacy.publishingMode
      : defaultBrandSettings.publishingMode;
  return {
    ...defaultBrandSettings,
    ...settings,
    testChannelId: String(settings.testChannelId || legacy.telegramChannelId || defaultBrandSettings.testChannelId),
    productionChannelId: String(settings.productionChannelId || legacy.telegramChannelId || defaultBrandSettings.productionChannelId),
    defaultSignature: String(settings.defaultSignature || legacy.agentSignature || defaultBrandSettings.defaultSignature),
    publishingMode,
  };
}
