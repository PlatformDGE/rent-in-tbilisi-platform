export type DealType = 'Rent' | 'Sale' | 'Daily Rent';
export type Category = 'Apartment' | 'House' | 'Commercial' | 'Land' | 'Office' | 'Hotel';
export type PropertyStatus = 'New' | 'In Progress' | 'On Advertising' | 'Reserved' | 'Rented' | 'Sold' | 'Archived';
export type PetPolicy = 'Allowed' | 'NotAllowed' | 'ByAgreement';
export type Currency = '$' | '₾' | '€';
export type TeamRole =
  | 'Рекрут 20%'
  | 'Рекрут 1.5 50%'
  | 'Агент 50%'
  | 'Агент 70%'
  | 'Агент 90%'
  | 'Оператор'
  | 'Администратор';
export type AuthRole = 'Администратор' | 'Оператор' | 'Агент';
export type ThemeMode = 'light' | 'dark';
export type PublicationStatus = 'Draft' | 'Copied' | 'Test Published' | 'Production Published' | 'Error';
export type PostLanguage = 'EN' | 'RU';
export type BuildingType = 'NewBuilding' | 'OldBuilding' | 'HistoricalBuilding' | 'Reconstruction';
export type RenovationType = 'New' | 'White' | 'Grey' | 'Yellow' | 'Mixed' | 'Old' | 'Retro' | 'UnderRepair';

export type PropertyPhoto = {
  id: string;
  name: string;
  src: string;
  type: 'upload' | 'url';
};

export type PropertyVideo = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  mode: 'metadata' | 'url';
};

export type Property = {
  id: string;
  dealType: DealType;
  category: Category;
  city: string;
  district: string;
  metro: string;
  address: string;
  mapLink: string;
  cadastralCode: string;
  building: string;
  source: string;
  titleRu: string;
  titleEn: string;
  descriptionRu: string;
  descriptionEn: string;
  price: string;
  currency: Currency;
  area: string;
  bedrooms: string;
  rooms: string;
  floor: string;
  totalFloors: string;
  tenantsCount: string;
  buildingType: BuildingType;
  renovation: RenovationType;
  heating: string;
  airConditioner: boolean;
  balcony: boolean;
  elevator: boolean;
  parking: boolean;
  dishwasher: boolean;
  oven: boolean;
  stove: boolean;
  tv: boolean;
  vacuumCleaner: boolean;
  shower: boolean;
  fridge: boolean;
  washingMachine: boolean;
  internet: boolean;
  petPolicy: PetPolicy;
  rentalTerm: string;
  deposit: string;
  clientCommission: '0%';
  ownerCommission: string;
  taxIncluded: boolean;
  agent: string;
  operator: string;
  publicationContact: string;
  owner: string;
  ownerPhone: string;
  ownerTelegram: string;
  status: PropertyStatus;
  exclusive: boolean;
  internalNotes: string;
  photos: PropertyPhoto[];
  mainPhotoId: string;
  videoUrl: string;
  videoMeta: PropertyVideo | null;
  createdAt: string;
  updatedAt: string;
};

export type PropertyFormState = Omit<Property, 'id' | 'createdAt' | 'updatedAt'>;

export type Agent = {
  id: string;
  name: string;
  telegram: string;
  phone: string;
  role: TeamRole;
  dealsCount: number;
  exclusiveCount: number;
  commissionPercent: number;
  isActive: boolean;
};

export type Owner = {
  id: string;
  name: string;
  phone: string;
  telegram: string;
  objects: string[];
  language: string;
  notes: string;
  trustManagement: boolean;
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  telegram: string;
  budget: string;
  request: string;
  district: string;
  status: string;
  agent: string;
  notes: string;
};

export type Deal = {
  id: string;
  propertyId: string;
  client: string;
  owner: string;
  agent: string;
  dealType: DealType;
  amount: string;
  commission: string;
  date: string;
  status: string;
  notes: string;
};

export type Publication = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  date: string;
  author: string;
  channel: 'Demo' | 'Test' | 'Production';
  status: PublicationStatus;
  text: string;
  photosCount: number;
  error?: string;
  messageLink?: string;
};

export type BrandSettings = {
  brandName: string;
  telegramUsername: string;
  testChannelId: string;
  productionChannelId: string;
  publishingMode: 'Demo' | 'Test' | 'Production';
  defaultLanguage: PostLanguage;
  defaultCurrency: Currency;
  includeMapBlock: boolean;
  includeReviewsBlock: boolean;
  includeZeroCommission: boolean;
  mainContact: string;
  phone: string;
  defaultSignature: string;
  operatorSignature: string;
};

export type Session = {
  name: string;
  role: AuthRole;
};

export type Toast = {
  id: string;
  message: string;
  tone: 'success' | 'warning' | 'info';
};
