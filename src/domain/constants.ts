import type {
  AuthRole,
  BrandSettings,
  BuildingType,
  Category,
  Currency,
  DealType,
  PetPolicy,
  PropertyFormState,
  PropertyStatus,
  RenovationType,
  TeamRole,
} from './types';

export const PROPERTY_STORAGE_KEY = 'molecula-crm-properties';
export const AGENT_STORAGE_KEY = 'molecula-crm-agents';
export const OWNER_STORAGE_KEY = 'molecula-crm-owners';
export const CLIENT_STORAGE_KEY = 'molecula-crm-clients';
export const DEAL_STORAGE_KEY = 'molecula-crm-deals';
export const PUBLICATION_STORAGE_KEY = 'molecula-crm-publications';
export const SETTINGS_STORAGE_KEY = 'molecula-crm-brand-settings';
export const SESSION_STORAGE_KEY = 'molecula-crm-session';
export const THEME_STORAGE_KEY = 'molecula-crm-theme';

export const dealTypes: DealType[] = ['Rent', 'Sale', 'Daily Rent'];
export const categories: Category[] = ['Apartment', 'House', 'Commercial', 'Land', 'Office', 'Hotel'];
export const propertyStatuses: PropertyStatus[] = ['New', 'In Progress', 'On Advertising', 'Reserved', 'Rented', 'Sold', 'Archived'];
export const petPolicies: PetPolicy[] = ['Allowed', 'NotAllowed', 'ByAgreement'];
export const currencies: Currency[] = ['$', '₾', '€'];
export const buildingTypes: BuildingType[] = ['NewBuilding', 'OldBuilding', 'HistoricalBuilding', 'Reconstruction'];
export const renovationTypes: RenovationType[] = ['New', 'White', 'Grey', 'Yellow', 'Mixed', 'Old', 'Retro', 'UnderRepair'];
export const cities = ['Tbilisi', 'Batumi', 'Kutaisi', 'Rustavi', 'Zugdidi', 'Mestia', 'Sighnaghi', 'Other'];
export const districtOptions = [
  'Vera',
  'Mtatsminda',
  'Vake',
  'Sololaki',
  'Kukia',
  'Nadzaladevi',
  'Naxalovka',
  'SavnetisUbani',
  'Tskneti',
  'Chugureti',
  'VazhaPshavela',
  'Nutsubidze',
  'Saburtalo',
  'Didube',
  'Gldani',
  'Avlabari',
  'Isani',
  'Samgori',
  'Digomi',
  'DidiDigomi',
  'DigomiMassive',
  'Digomi1to9',
  'Varketili',
  'Ortachala',
  'Abanotubani',
  'Saguramo',
  'Krtsanisi',
  'Vashlijvari',
  'Temqa',
  'Iverubani',
  'Vazisubani',
  'Afrika',
  'QvemoPonichala',
  'Ponichala',
  'Avchala',
  'Bagebi',
  'Lisi',
  'Tskhneti',
  'OutOfTown',
];
export const metroOptions = [
  '',
  'LibertySquare',
  'Rustaveli',
  'Marjanishvili',
  'StationSquare',
  'Tsereteli',
  'Gotsiridze',
  'Nadzaladevi',
  'Didube',
  'Grmagele',
  'Guramishvili',
  'Sarajishvili',
  'AhmeteliTheatre',
  'STUniversity',
  'VazhaPshavela',
  'Delisi',
  'TCUniversity',
  'MCUniversity',
  'AvlabariMetro',
  'IsaniMetro',
  '300Aragveli',
  'SamgoriMetro',
  'Varketili',
];
export const sourceOptions = ['Owner', 'Agent', 'Telegram', 'Google Sheets', 'Website', 'Referral', 'Old Database', 'Other'];
export const heatingOptions = ['CentralHeating', 'GasHeating', 'ElectricalHeating', 'ACHeating', 'Fireplace'];
export const MAX_TELEGRAM_PHOTOS = 9;
export const MAX_VIDEO_SIZE_MB = 1000;
export const authRoles: AuthRole[] = ['Администратор', 'Оператор', 'Агент'];
export const teamRoles: TeamRole[] = [
  'Рекрут 20%',
  'Рекрут 1.5 50%',
  'Агент 50%',
  'Агент 70%',
  'Агент 90%',
  'Оператор',
  'Администратор',
];

export const defaultBrandSettings: BrandSettings = {
  brandName: 'Rent in Tbilisi',
  telegramUsername: '@David_Tibelashvili',
  testChannelId: 'https://t.me/+AmfvOMugNNgwODYy',
  productionChannelId: '@rent_in_tbilisi',
  publishingMode: 'Demo',
  defaultLanguage: 'EN',
  defaultCurrency: '$',
  includeMapBlock: true,
  includeReviewsBlock: false,
  includeZeroCommission: true,
  mainContact: '@David_Tibelashvili',
  phone: '+995 599 20 67 16',
  defaultSignature: '#Sergi',
  operatorSignature: 'Molecula Operator',
};

export const emptyProperty: PropertyFormState = {
  dealType: 'Rent',
  category: 'Apartment',
  city: 'Tbilisi',
  district: '',
  metro: '',
  address: '',
  mapLink: '',
  cadastralCode: '',
  building: '',
  source: 'Owner',
  titleRu: '',
  titleEn: '',
  descriptionRu: '',
  descriptionEn: '',
  price: '',
  currency: '$',
  area: '',
  bedrooms: '',
  rooms: '',
  floor: '',
  totalFloors: '',
  tenantsCount: '1-4',
  buildingType: 'NewBuilding',
  renovation: 'White',
  heating: 'CentralHeating',
  airConditioner: false,
  balcony: false,
  elevator: false,
  parking: false,
  dishwasher: false,
  oven: false,
  stove: true,
  tv: true,
  vacuumCleaner: true,
  shower: true,
  fridge: true,
  washingMachine: true,
  internet: true,
  petPolicy: 'ByAgreement',
  rentalTerm: '12Month',
  deposit: '',
  clientCommission: '0%',
  ownerCommission: '50%',
  taxIncluded: false,
  agent: 'David Tibelashvili',
  operator: 'Mari',
  publicationContact: '@David_Tibelashvili',
  owner: '',
  ownerPhone: '',
  ownerTelegram: '',
  status: 'New',
  exclusive: false,
  internalNotes: '',
  photos: [],
  mainPhotoId: '',
  videoUrl: '',
  videoMeta: null,
};
