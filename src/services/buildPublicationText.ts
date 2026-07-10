import type { Property } from '../domain/property';
import { getTaxonomyHashtag } from './publicationTaxonomy';

const hashtag = (id: string) => getTaxonomyHashtag(id);
const chunk = <T,>(items: T[], size = 2) => Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, index * size + size));
const currencySymbol = (property: Property) => property.currency === 'USD' ? '$' : property.currency === 'GEL' ? '₾' : '€';

const PRICE_RANGES = {
  rent: [[0, 300, 'priceRange.Price0to300'], [300, 500, 'priceRange.Price300to500'], [500, 700, 'priceRange.Price500to700'], [700, 900, 'priceRange.Price700to900'], [900, 1200, 'priceRange.Price900to1200'], [1200, Infinity, 'priceRange.Price1200plus']],
  sale: [[0, 30000, 'priceRange.Price0to30000'], [30000, 50000, 'priceRange.Price30000to50000'], [50000, 70000, 'priceRange.Price50000to70000'], [70000, 90000, 'priceRange.Price70000to90000'], [90000, 120000, 'priceRange.Price90000to120000'], [120000, 150000, 'priceRange.Price120000to150000'], [150000, 180000, 'priceRange.Price150000to180000'], [180000, 210000, 'priceRange.Price180000to210000'], [210000, 240000, 'priceRange.Price210000to240000'], [240000, 270000, 'priceRange.Price240000to270000'], [270000, 300000, 'priceRange.Price270000to300000'], [300000, 330000, 'priceRange.Price300000to330000'], [330000, 360000, 'priceRange.Price330000to360000'], [360000, 390000, 'priceRange.Price360000to390000'], [390000, 420000, 'priceRange.Price390000to420000'], [420000, 450000, 'priceRange.Price420000to450000'], [450000, 480000, 'priceRange.Price450000to480000'], [480000, 510000, 'priceRange.Price480000to510000'], [510000, 600000, 'priceRange.Price510000to600000'], [600000, 700000, 'priceRange.Price600000to700000'], [700000, 800000, 'priceRange.Price700000to800000'], [800000, 900000, 'priceRange.Price800000to900000'], [900000, 1000000, 'priceRange.Price900000to1000000'], [1000000, Infinity, 'priceRange.Price1000000plus']],
} as const;

const priceRanges = (property: Property) => PRICE_RANGES[property.dealType]
  .filter(([minimum, maximum]) => (property.price > minimum && property.price <= maximum) || (property.price === minimum && minimum > 0))
  .map(([, , id]) => hashtag(id));

const agentBlock = (property: Property) => `📲 @David_Tibelashvili |\n+995 599 20 67 16 ${property.agentHashtag ? `#${property.agentHashtag.replace(/^#/, '')}` : '#???'}`;
const locationBlock = (property: Property) => [
  `${hashtag(property.districtId)}${property.metroId ? ` 🚇 ${hashtag(property.metroId)}` : ''}`,
  property.address ? `📍 ${property.address}` : '',
].filter(Boolean).join('\n');

const objectBlock = (property: Property, dealType: 'rent' | 'sale') => {
  const type = hashtag(property.commercialTypeId) || hashtag(property.residentialSubtypeId) || hashtag(property.propertyTypeId);
  const lines = [`🏢 ${hashtag(property.bedroomsId)} ${type} for ${hashtag(`dealType.${dealType === 'rent' ? 'Rent' : 'Sale'}`)}`.replace(/\s+/g, ' ').trim()];
  const style = [hashtag(property.buildingTypeId), hashtag(property.designId)].filter(Boolean);
  if (style.length) lines.push(`✨ ${style.join(' | ')}`);
  if (dealType === 'sale' && property.conditionId) lines.push(`🛠️ ${hashtag(property.conditionId)}`);
  const specs: string[] = [];
  if (property.area !== null) specs.push(`${property.area} Sq.m`);
  if (property.floor !== null || property.totalFloors !== null) specs.push(`${property.floor ?? '—'}/${property.totalFloors ?? '—'} Floor`);
  const bathId = dealType === 'rent' ? property.amenityIds.find(id => ['amenity.Bath', 'amenity.Shower'].includes(id)) : undefined;
  const heatingId = dealType === 'rent' ? property.amenityIds.find(id => ['amenity.CentralHeating', 'amenity.GasHeating', 'amenity.ElectricalHeating', 'amenity.ACHeating'].includes(id)) : undefined;
  const details = [heatingId ? hashtag(heatingId) : '', bathId ? `${hashtag(bathId)}${property.bathrooms && property.bathrooms > 1 ? ` (${property.bathrooms})` : ''}` : ''].filter(Boolean).join(' | ');
  if (specs.length || details) lines.push(`🏠 ${specs.join(' | ')}${details ? ` |\n${details}` : ' |'}`);
  return lines.join('\n');
};

const AMENITY_ORDER = ['amenity.Stove', 'amenity.Oven', 'amenity.Conditioner', 'amenity.WiFi', 'amenity.Balcony', 'amenity.Terrace', 'amenity.Courtyard', 'amenity.ParkingPlace', 'amenity.CentralHeating', 'amenity.Bath', 'amenity.Shower', 'amenity.Dishwasher', 'amenity.TV', 'amenity.Elevator', 'amenity.Microwave', 'amenity.VacuumCleaner', 'amenity.Fireplace'];
const NEGATIVE_AMENITIES: [string, string][] = [['amenity.Dishwasher', 'Dishwasher'], ['amenity.TV', 'TV'], ['amenity.ParkingPlace', 'Parking Place'], ['amenity.Elevator', 'Elevator'], ['amenity.Oven', 'Oven'], ['amenity.Conditioner', 'Conditioner']];
const RENT_SPEC_AMENITIES = new Set(['amenity.Bath', 'amenity.Shower', 'amenity.CentralHeating', 'amenity.GasHeating', 'amenity.ElectricalHeating', 'amenity.ACHeating']);

const amenityBlocks = (property: Property, includeNegatives: boolean) => {
  const positive = property.amenityIds
    .filter(id => !includeNegatives || !RENT_SPEC_AMENITIES.has(id))
    .sort((a, b) => AMENITY_ORDER.indexOf(a) - AMENITY_ORDER.indexOf(b))
    .map(id => id === 'amenity.Balcony' && property.balconyCount > 1 ? `${hashtag(id)} (${property.balconyCount})` : id === 'amenity.Terrace' && property.terraceCount > 1 ? `${hashtag(id)} (${property.terraceCount})` : hashtag(id))
    .filter(Boolean);
  const blocks: string[] = [];
  if (positive.length) blocks.push(chunk(positive).map(row => row.map(value => `✅ ${value}`).join(' ')).join('\n'));
  if (includeNegatives) {
    const negative = NEGATIVE_AMENITIES.filter(([id]) => !property.amenityIds.includes(id)).map(([, label]) => label);
    if (negative.length) blocks.push(chunk(negative).map(row => row.map(value => `✖️ ${value}`).join(' ')).join('\n'));
  }
  return blocks;
};

const rentPublicationTemplate = (property: Property) => {
  const blocks = [locationBlock(property), objectBlock(property, 'rent'), ...amenityBlocks(property, true)];
  blocks.push([`💰 ${currencySymbol(property)}${property.price}${property.deposit !== null ? ` + Deposit ${currencySymbol(property)}${property.deposit}` : ''}`, '0% Commission', ...priceRanges(property)].join('\n'));
  const terms: string[] = [];
  if (property.maxTenants) terms.push(`👬 Tenants: 1-${property.maxTenants}`);
  if (property.petId) terms.push(`🐕 Pets: ${hashtag(property.petId)}`);
  if (property.rentalPeriodIds.length) terms.push(`🕐 ${property.rentalPeriodIds.map(hashtag).join(' ')}`);
  if (terms.length) blocks.push(terms.join('\n'));
  blocks.push(agentBlock(property), '📍 APARTMENTS ON MAP 📍');
  return blocks;
};

const salePublicationTemplate = (property: Property) => [
  locationBlock(property), objectBlock(property, 'sale'), ...amenityBlocks(property, false),
  [`💰 ${currencySymbol(property)}${property.price}`, ...priceRanges(property)].join('\n'),
  agentBlock(property), '📍 APARTMENTS ON MAP 📍',
];

const renderTemplate = (blocks: string[]) => blocks.filter(Boolean).join('\n\n').split('\n').map(line => line.trimEnd()).join('\n');
const buildRentPublicationText = (property: Property) => renderTemplate(rentPublicationTemplate(property));
const buildSalePublicationText = (property: Property) => renderTemplate(salePublicationTemplate(property));

export const buildPublicationText = (property: Property): string => property.dealType === 'sale' ? buildSalePublicationText(property) : buildRentPublicationText(property);
