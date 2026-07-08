import { buildingTypes, heatingOptions, MAX_TELEGRAM_PHOTOS, renovationTypes } from './constants';
import type { BrandSettings, Category, DealType, PetPolicy, PostLanguage, Property } from './types';
import { safeNumber } from './formatters';

export const districtTags: Record<string, string> = {
  Vera: '#Vera',
  Mtatsminda: '#Mtatsminda',
  Vake: '#Vake',
  Sololaki: '#Sololaki',
  Kukia: '#Kukia',
  Nadzaladevi: '#Nadzaladevi',
  Naxalovka: '#Naxalovka',
  SavnetisUbani: '#SavnetisUbani',
  'Savnetis Ubani': '#SavnetisUbani',
  Tskneti: '#Tskneti',
  Tskhneti: '#Tskhneti',
  Chugureti: '#Chugureti',
  VazhaPshavela: '#VazhaPshavela',
  'Vazha Pshavela': '#VazhaPshavela',
  Nutsubidze: '#Nutsubidze',
  Saburtalo: '#Saburtalo',
  Didube: '#Didube',
  Gldani: '#Gldani',
  Avlabari: '#Avlabari',
  Isani: '#Isani',
  Samgori: '#Samgori',
  Digomi: '#Digomi',
  DidiDigomi: '#DidiDigomi',
  'Didi Digomi': '#DidiDigomi',
  DigomiMassive: '#DigomiMassive',
  'Digomi Massive': '#DigomiMassive',
  Digomi1to9: '#Digomi1to9',
  Varketili: '#Varketili',
  Ortachala: '#Ortachala',
  Abanotubani: '#Abanotubani',
  Saguramo: '#Saguramo',
  Krtsanisi: '#Krtsanisi',
  Vashlijvari: '#Vashlijvari',
  Temqa: '#Temqa',
  Iverubani: '#Iverubani',
  Vazisubani: '#Vazisubani',
  Afrika: '#Afrika',
  QvemoPonichala: '#QvemoPonichala',
  Ponichala: '#Ponichala',
  Avchala: '#Avchala',
  Bagebi: '#Bagebi',
  Lisi: '#Lisi',
  'Old Tbilisi': '#Avlabari',
};

export const metroTags: Record<string, string> = {
  'Liberty Square': '#LibertySquare',
  LibertySquare: '#LibertySquare',
  Rustaveli: '#Rustaveli',
  Marjanishvili: '#Marjanishvili',
  'Station Square': '#StationSquare',
  StationSquare: '#StationSquare',
  Tsereteli: '#Tsereteli',
  Gotsiridze: '#Gotsiridze',
  Nadzaladevi: '#Nadzaladevi',
  Didube: '#Didube',
  Grmagele: '#Grmagele',
  Guramishvili: '#Guramishvili',
  Sarajishvili: '#Sarajishvili',
  'Ahmeteli Theatre': '#AhmeteliTheatre',
  AhmeteliTheatre: '#AhmeteliTheatre',
  STUniversity: '#STUniversity',
  'Vazha Pshavela': '#VazhaPshavela',
  VazhaPshavela: '#VazhaPshavela',
  Delisi: '#Delisi',
  TCUniversity: '#TCUniversity',
  'Medical University': '#MCUniversity',
  MCUniversity: '#MCUniversity',
  AvlabariMetro: '#AvlabariMetro',
  '300 Aragveli': '#300Aragveli',
  '300Aragveli': '#300Aragveli',
  IsaniMetro: '#IsaniMetro',
  SamgoriMetro: '#SamgoriMetro',
  Varketili: '#Varketili',
};

export const categoryTags: Record<Category, string> = {
  Apartment: '#Apartment',
  House: '#House',
  Commercial: '#Commercial',
  Land: '#Commercial',
  Office: '#Commercial',
  Hotel: '#Commercial',
};

function tagFromMap(map: Record<string, string>, value: string) {
  return map[value] || '';
}

function bedTag(value: string) {
  const numeric = safeNumber(value);
  if (numeric <= 0) return '';
  const bedrooms = Math.min(Math.max(Math.round(numeric), 1), 4);
  return `#${bedrooms}Bed`;
}

function dealTag(value: DealType) {
  if (value === 'Sale') return '#Sale';
  if (value === 'Daily Rent') return '#DailyRent';
  return '#Rent';
}

function petTag(value: PetPolicy) {
  return `#${value}`;
}

function controlledHashTag(value: string, allowed: readonly string[]) {
  return allowed.includes(value) ? `#${value}` : '';
}

export function priceRangeTag(price: string) {
  const numeric = safeNumber(price);
  if (numeric <= 0) return '';
  if (numeric < 300) return '#Price0to300';
  if (numeric < 500) return '#Price300to500';
  if (numeric < 700) return '#Price500to700';
  if (numeric < 900) return '#Price700to900';
  if (numeric <= 1200) return '#Price900to1200';
  return '#Price1200plus';
}

export function telegramPhotoCount(property: Property) {
  return Math.min(property.photos.length, MAX_TELEGRAM_PHOTOS);
}

export function buildTelegramPost(property: Property, settings: BrandSettings, language: PostLanguage, forcedDealType?: DealType) {
  const dealType = forcedDealType || property.dealType;
  const districtTag = tagFromMap(districtTags, property.district) || '#OutOfTown';
  const metroTag = tagFromMap(metroTags, property.metro);
  const floor = property.floor && property.totalFloors ? `${property.floor}/${property.totalFloors} Floor` : '';
  const primaryLineTags = [bedTag(property.bedrooms), categoryTags[property.category], 'for', dealTag(dealType)]
    .filter(Boolean)
    .join(' ');
  const amenityRows = [
    [property.balcony && '#Balcony', property.internet && '#WiFi', property.tv && '#TV'],
    [property.stove && '#Stove', property.vacuumCleaner && '#VacuumCleaner'],
    [property.elevator && '#Elevator', property.oven && '#Oven'],
    [property.parking && '#ParkingPlace'],
    [property.airConditioner && '#Conditioner'],
  ]
    .map((row) => row.filter(Boolean).map((tag) => `✅ ${tag}`).join(' '))
    .filter(Boolean);
  const buildingLine = [controlledHashTag(property.buildingType, buildingTypes), controlledHashTag(property.renovation, renovationTypes)]
    .filter(Boolean)
    .join(' | ');
  const specLine = [property.area ? `${property.area} sq.m` : '', floor].filter(Boolean).join(' | ');
  const heatingLine = [controlledHashTag(property.heating, heatingOptions), property.shower ? '#Shower' : ''].filter(Boolean).join(' | ');
  const moneyValue =
    property.price && (dealType === 'Rent' || dealType === 'Daily Rent')
      ? `${property.price}${property.currency} + Deposit ${property.deposit || property.price}${property.currency}`
      : property.price
        ? `${property.price}${property.currency}`
        : '';
  const money =
    moneyValue && (dealType === 'Rent' || dealType === 'Daily Rent' || dealType === 'Sale') ? `💰${moneyValue}` : '';
  const contact = property.publicationContact || settings.mainContact;
  const contactSignature = language === 'RU' ? settings.defaultSignature : settings.defaultSignature;
  const tenantsLine = property.tenantsCount && dealType !== 'Sale' ? `👫Tenants: ${property.tenantsCount}` : '';
  const petsLine = dealType !== 'Sale' ? `🐕Pets: ${petTag(property.petPolicy)}` : '';
  const priceTag = priceRangeTag(property.price);

  return [
    `${districtTag}${metroTag ? ` 🚇 ${metroTag}` : ''}`,
    property.address ? `📍${property.address}` : '',
    '',
    ...(property.exclusive ? ['❗️#Exclusive', ''] : []),
    `🏢 ${primaryLineTags}`,
    buildingLine ? `✨ ${buildingLine}` : '',
    specLine ? `🏠${specLine} |` : '',
    heatingLine,
    '',
    ...amenityRows,
    '',
    tenantsLine,
    petsLine,
    '',
    money,
    ...(settings.includeZeroCommission ? ['0% Commission'] : []),
    priceTag,
    '',
    `➡️🏢 ${contact} |`,
    `${settings.phone} ${contactSignature}`,
    '',
    ...(settings.includeMapBlock ? ['📍APARTMENTS ON MAP📍'] : []),
  ]
    .filter((line, index, lines) => line !== '' || lines[index - 1] !== '')
    .join('\n')
    .trim();
}
