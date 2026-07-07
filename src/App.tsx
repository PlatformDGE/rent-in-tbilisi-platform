import {
  ArrowLeft,
  BarChart3,
  Building2,
  Camera,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Handshake,
  Home,
  ImagePlus,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Moon,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { ChangeEvent, FormEvent, ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

type DealType = 'Rent' | 'Sale' | 'Daily Rent';
type Category = 'Apartment' | 'House' | 'Commercial' | 'Land' | 'Office' | 'Hotel';
type PropertyStatus = 'New' | 'In Progress' | 'On Advertising' | 'Reserved' | 'Rented' | 'Sold' | 'Archived';
type PetPolicy = 'Allowed' | 'NotAllowed' | 'ByAgreement';
type Currency = '$' | '₾' | '€';
type TeamRole =
  | 'Рекрут 20%'
  | 'Рекрут 1.5 50%'
  | 'Агент 50%'
  | 'Агент 70%'
  | 'Агент 90%'
  | 'Оператор'
  | 'Администратор';
type AuthRole = 'Администратор' | 'Оператор' | 'Агент';
type ThemeMode = 'light' | 'dark';
type PublicationStatus = 'Draft' | 'Copied' | 'Test Published' | 'Production Published' | 'Error';
type PostLanguage = 'EN' | 'RU';
type BuildingType = 'NewBuilding' | 'OldBuilding' | 'HistoricalBuilding' | 'Reconstruction';
type RenovationType = 'New' | 'White' | 'Grey' | 'Yellow' | 'Mixed' | 'Old' | 'Retro' | 'UnderRepair';

type PropertyPhoto = {
  id: string;
  name: string;
  src: string;
  type: 'upload' | 'url';
};

type Property = {
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
  createdAt: string;
  updatedAt: string;
};

type PropertyFormState = Omit<Property, 'id' | 'createdAt' | 'updatedAt'>;

type Agent = {
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

type Owner = {
  id: string;
  name: string;
  phone: string;
  telegram: string;
  objects: string[];
  language: string;
  notes: string;
  trustManagement: boolean;
};

type Client = {
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

type Deal = {
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

type Publication = {
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

type BrandSettings = {
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

type Session = {
  name: string;
  role: AuthRole;
};

type Toast = {
  id: string;
  message: string;
  tone: 'success' | 'warning' | 'info';
};

type CrmContextValue = {
  agents: Agent[];
  brandSettings: BrandSettings;
  clients: Client[];
  deals: Deal[];
  deleteProperty: (id: string) => void;
  owners: Owner[];
  properties: Property[];
  publications: Publication[];
  session: Session | null;
  setBrandSettings: (settings: BrandSettings) => void;
  setSession: (session: Session | null) => void;
  setTheme: (theme: ThemeMode) => void;
  showToast: (message: string, tone?: Toast['tone']) => void;
  theme: ThemeMode;
  upsertProperty: (property: Property) => void;
  addPublication: (publication: Publication) => void;
};

const PROPERTY_STORAGE_KEY = 'molecula-crm-properties';
const AGENT_STORAGE_KEY = 'molecula-crm-agents';
const OWNER_STORAGE_KEY = 'molecula-crm-owners';
const CLIENT_STORAGE_KEY = 'molecula-crm-clients';
const DEAL_STORAGE_KEY = 'molecula-crm-deals';
const PUBLICATION_STORAGE_KEY = 'molecula-crm-publications';
const SETTINGS_STORAGE_KEY = 'molecula-crm-brand-settings';
const SESSION_STORAGE_KEY = 'molecula-crm-session';
const THEME_STORAGE_KEY = 'molecula-crm-theme';

const dealTypes: DealType[] = ['Rent', 'Sale', 'Daily Rent'];
const categories: Category[] = ['Apartment', 'House', 'Commercial', 'Land', 'Office', 'Hotel'];
const propertyStatuses: PropertyStatus[] = ['New', 'In Progress', 'On Advertising', 'Reserved', 'Rented', 'Sold', 'Archived'];
const petPolicies: PetPolicy[] = ['Allowed', 'NotAllowed', 'ByAgreement'];
const currencies: Currency[] = ['$', '₾', '€'];
const buildingTypes: BuildingType[] = ['NewBuilding', 'OldBuilding', 'HistoricalBuilding', 'Reconstruction'];
const renovationTypes: RenovationType[] = ['New', 'White', 'Grey', 'Yellow', 'Mixed', 'Old', 'Retro', 'UnderRepair'];
const authRoles: AuthRole[] = ['Администратор', 'Оператор', 'Агент'];
const teamRoles: TeamRole[] = [
  'Рекрут 20%',
  'Рекрут 1.5 50%',
  'Агент 50%',
  'Агент 70%',
  'Агент 90%',
  'Оператор',
  'Администратор',
];

const fallbackPhotos: PropertyPhoto[] = [
  {
    id: 'url-vake-living',
    name: 'Living room',
    src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    type: 'url',
  },
  {
    id: 'url-vake-bedroom',
    name: 'Bedroom',
    src: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80',
    type: 'url',
  },
  {
    id: 'url-vake-kitchen',
    name: 'Kitchen',
    src: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80',
    type: 'url',
  },
];

const defaultBrandSettings: BrandSettings = {
  brandName: 'Rent in Tbilisi',
  telegramUsername: '@David_Tibelashvili',
  testChannelId: '@rentintbilisi_test',
  productionChannelId: '@rentintbilisi',
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

const emptyProperty: PropertyFormState = {
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
};

const starterProperties: Property[] = [
  {
    ...emptyProperty,
    id: 'RIT-1001',
    dealType: 'Rent',
    category: 'Apartment',
    city: 'Tbilisi',
    district: 'Vake',
    metro: 'Rustaveli',
    address: 'Ilia Chavchavadze Ave 37',
    mapLink: 'https://maps.google.com/',
    cadastralCode: '',
    building: 'Axis Towers area',
    source: 'Owner',
    titleRu: 'Светлая квартира в Vake',
    titleEn: 'Beautiful apartment for rent in Vake',
    descriptionRu: 'Светлая квартира рядом с парком, готова к показам.',
    descriptionEn: 'Bright apartment near Vake Park, ready for viewings.',
    price: '1200',
    currency: '$',
    area: '72',
    bedrooms: '2',
    rooms: '3',
    floor: '8',
    totalFloors: '12',
    tenantsCount: '1-4',
    buildingType: 'NewBuilding',
    renovation: 'White',
    heating: 'CentralHeating',
    balcony: true,
    elevator: true,
    dishwasher: true,
    oven: true,
    stove: true,
    tv: true,
    vacuumCleaner: true,
    shower: true,
    fridge: true,
    washingMachine: true,
    internet: true,
    deposit: '1200',
    taxIncluded: false,
    owner: 'Giorgi Maisuradze',
    ownerPhone: '+995 599 10 20 30',
    ownerTelegram: '@giorgi_owner',
    publicationContact: '@David_Tibelashvili',
    status: 'On Advertising',
    exclusive: true,
    internalNotes: 'Показы после 18:00. Ключи у консьержа.',
    photos: fallbackPhotos,
    mainPhotoId: fallbackPhotos[0].id,
    videoUrl: '',
    createdAt: '2026-07-01T10:00:00.000Z',
    updatedAt: '2026-07-01T10:00:00.000Z',
  },
  {
    ...emptyProperty,
    id: 'RIT-1002',
    dealType: 'Sale',
    category: 'Apartment',
    city: 'Tbilisi',
    district: 'Sololaki',
    metro: 'Liberty Square',
    address: 'Atoneli St 12',
    mapLink: 'https://maps.google.com/',
    cadastralCode: '',
    building: 'Old Tbilisi residence',
    source: 'Owner',
    titleRu: 'Квартира в историческом доме',
    titleEn: 'Apartment for sale in historic Sololaki',
    descriptionRu: 'Исторический дом, высокий потолок, чистые документы.',
    descriptionEn: 'Historic building, high ceiling, clear ownership documents.',
    price: '185000',
    currency: '$',
    area: '96',
    bedrooms: '3',
    rooms: '4',
    floor: '3',
    totalFloors: '5',
    tenantsCount: '',
    buildingType: 'HistoricalBuilding',
    renovation: 'Mixed',
    heating: 'CentralHeating',
    balcony: true,
    oven: true,
    stove: true,
    tv: true,
    vacuumCleaner: true,
    shower: true,
    fridge: true,
    internet: true,
    taxIncluded: true,
    owner: 'Mariam Janelidze',
    ownerPhone: '+995 577 44 55 66',
    ownerTelegram: '@mariam_owner',
    publicationContact: '@David_Tibelashvili',
    status: 'Sold',
    exclusive: false,
    internalNotes: 'Сделка закрыта, документы в архиве.',
    photos: [
      {
        id: 'url-sololaki-main',
        name: 'Sololaki apartment',
        src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
        type: 'url',
      },
    ],
    mainPhotoId: 'url-sololaki-main',
    videoUrl: '',
    createdAt: '2026-06-28T12:20:00.000Z',
    updatedAt: '2026-06-28T12:20:00.000Z',
  },
  {
    ...emptyProperty,
    id: 'RIT-1003',
    dealType: 'Rent',
    category: 'Apartment',
    city: 'Tbilisi',
    district: 'Saburtalo',
    metro: 'Medical University',
    address: 'Bakhtrioni St 22',
    mapLink: 'https://maps.google.com/',
    cadastralCode: '',
    source: 'Owner',
    titleRu: 'Уютная квартира у метро',
    titleEn: 'Cozy apartment near metro',
    descriptionRu: 'Подходит для пары или одного человека, можно с маленьким питомцем.',
    descriptionEn: 'Good fit for one person or a couple, small pets negotiable.',
    price: '850',
    currency: '$',
    area: '61',
    bedrooms: '1',
    rooms: '2',
    floor: '6',
    totalFloors: '10',
    tenantsCount: '1-2',
    buildingType: 'NewBuilding',
    renovation: 'Grey',
    heating: 'CentralHeating',
    balcony: true,
    elevator: true,
    oven: true,
    stove: true,
    tv: true,
    vacuumCleaner: true,
    shower: true,
    fridge: true,
    washingMachine: true,
    internet: true,
    petPolicy: 'ByAgreement',
    deposit: '850',
    taxIncluded: false,
    owner: 'Irakli Nadiradze',
    ownerPhone: '+995 555 77 88 90',
    ownerTelegram: '@irakli_owner',
    publicationContact: '@David_Tibelashvili',
    status: 'In Progress',
    exclusive: true,
    internalNotes: 'Нужен новый фотоотчет перед публикацией.',
    photos: [
      {
        id: 'url-saburtalo-main',
        name: 'Saburtalo apartment',
        src: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=80',
        type: 'url',
      },
    ],
    mainPhotoId: 'url-saburtalo-main',
    videoUrl: '',
    createdAt: '2026-06-20T09:10:00.000Z',
    updatedAt: '2026-06-20T09:10:00.000Z',
  },
];

const extraSeedProperties: Property[] = [
  ['RIT-1004', 'Rent', 'Vera', 'Rustaveli', '25 Barnovi Street', '980', '58', '1', '4', '9', 'Rented', 'Nino Beridze'],
  ['RIT-1005', 'Rent', 'Saburtalo', 'MCUniversity', '14b Shalva Nutsubidze Street', '1000', '105', '2', '5', '12', 'On Advertising', 'David Tibelashvili'],
  ['RIT-1006', 'Sale', 'Vake', 'Delisi', 'Mtskheta Street 18', '245000', '118', '3', '6', '14', 'On Advertising', 'Ana Lomidze'],
  ['RIT-1007', 'Rent', 'Didi Digomi', 'Didube', 'Mirian Mepe Avenue 41', '650', '72', '2', '3', '8', 'In Progress', 'Nino Beridze'],
  ['RIT-1008', 'Sale', 'Krtsanisi', '300 Aragveli', 'Krtsanisi Residence', '320000', '140', '3', '9', '12', 'Sold', 'David Tibelashvili'],
  ['RIT-1009', 'Rent', 'Varketili', 'Varketili', 'Javakheti Street 7', '480', '46', '1', '2', '9', 'Archived', 'Mari Operator'],
  ['RIT-1010', 'Daily Rent', 'Old Tbilisi', 'AvlabariMetro', 'Metekhi Rise 4', '95', '38', '1', '2', '4', 'New', 'Ana Lomidze'],
].map(([id, dealType, district, metro, address, price, area, bedrooms, floor, totalFloors, status, agent], index) => {
  const photo = {
    id: `${id}-photo`,
    name: `${district} apartment`,
    src: fallbackPhotos[index % fallbackPhotos.length].src,
    type: 'url' as const,
  };
  return {
    ...emptyProperty,
    id,
    dealType: dealType as DealType,
    category: 'Apartment',
    city: 'Tbilisi',
    district,
    metro,
    address,
    mapLink: 'https://maps.google.com/',
    source: 'Owner',
    building: 'Residential building',
    titleRu: `${district} ${dealType === 'Rent' ? 'аренда' : 'продажа'}`,
    titleEn: `${bedrooms} bedroom apartment in ${district}`,
    descriptionRu: 'Seed объект для аналитики и проверки CRM.',
    descriptionEn: 'Seed listing for CRM analytics and QA.',
    price,
    area,
    bedrooms,
    rooms: String(Number(bedrooms) + 1),
    floor,
    totalFloors,
    tenantsCount: dealType === 'Sale' ? '' : '1-4',
    buildingType: index % 3 === 0 ? 'OldBuilding' : 'NewBuilding',
    renovation: index % 2 === 0 ? 'White' : 'Grey',
    heating: 'CentralHeating',
    balcony: true,
    elevator: true,
    oven: true,
    stove: true,
    tv: true,
    vacuumCleaner: true,
    shower: true,
    internet: true,
    parking: index % 2 === 0,
    airConditioner: true,
    petPolicy: 'ByAgreement',
    deposit: dealType === 'Sale' ? '' : price,
    owner: `Owner ${index + 4}`,
    ownerPhone: '+995 599 20 67 16',
    ownerTelegram: '@owner_seed',
    status: status as PropertyStatus,
    exclusive: index % 2 === 0,
    agent,
    operator: 'Mari',
    publicationContact: '@David_Tibelashvili',
    photos: [photo],
    mainPhotoId: photo.id,
    createdAt: `2026-07-0${Math.min(index + 1, 8)}T10:00:00.000Z`,
    updatedAt: `2026-07-0${Math.min(index + 1, 8)}T12:00:00.000Z`,
  };
});

const seedProperties = [...starterProperties, ...extraSeedProperties];

const starterAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'David Tibelashvili',
    telegram: '@David_Tibelashvili',
    phone: '+995 599 20 67 16',
    role: 'Администратор',
    dealsCount: 42,
    exclusiveCount: 22,
    commissionPercent: 0,
    isActive: true,
  },
  {
    id: 'agent-2',
    name: 'Mari Operator',
    telegram: '@mari_molecula',
    phone: '+995 577 44 55 66',
    role: 'Оператор',
    dealsCount: 15,
    exclusiveCount: 8,
    commissionPercent: 0,
    isActive: true,
  },
  {
    id: 'agent-3',
    name: 'Nino Beridze',
    telegram: '@nino_molecula',
    phone: '+995 599 10 20 30',
    role: 'Агент 70%',
    dealsCount: 18,
    exclusiveCount: 9,
    commissionPercent: 70,
    isActive: true,
  },
  {
    id: 'agent-4',
    name: 'Ana Lomidze',
    telegram: '@ana_molecula',
    phone: '+995 555 77 88 90',
    role: 'Агент 50%',
    dealsCount: 11,
    exclusiveCount: 5,
    commissionPercent: 50,
    isActive: true,
  },
  {
    id: 'agent-5',
    name: 'Sergi Matchavariani',
    telegram: '@sergi_molecula',
    phone: '+995 599 88 77 66',
    role: 'Агент 90%',
    dealsCount: 27,
    exclusiveCount: 16,
    commissionPercent: 90,
    isActive: true,
  },
];

const starterOwners: Owner[] = [
  {
    id: 'owner-1',
    name: 'Giorgi Maisuradze',
    phone: '+995 599 10 20 30',
    telegram: '@giorgi_owner',
    objects: ['RIT-1001'],
    language: 'RU/EN',
    notes: 'Предпочитает сообщения в Telegram.',
    trustManagement: true,
  },
  {
    id: 'owner-2',
    name: 'Mariam Janelidze',
    phone: '+995 577 44 55 66',
    telegram: '@mariam_owner',
    objects: ['RIT-1002'],
    language: 'RU',
    notes: 'Документы проверены.',
    trustManagement: false,
  },
  {
    id: 'owner-3',
    name: 'Irakli Nadiradze',
    phone: '+995 555 77 88 90',
    telegram: '@irakli_owner',
    objects: ['RIT-1003'],
    language: 'EN',
    notes: 'Готов к эксклюзиву после первой сдачи.',
    trustManagement: true,
  },
  {
    id: 'owner-4',
    name: 'Natia Dolidze',
    phone: '+995 598 44 33 22',
    telegram: '@natia_owner',
    objects: ['RIT-1006'],
    language: 'GE/RU',
    notes: 'Просит отчеты по показам каждую неделю.',
    trustManagement: false,
  },
  {
    id: 'owner-5',
    name: 'Saba Kordzaia',
    phone: '+995 557 22 11 00',
    telegram: '@saba_owner',
    objects: ['RIT-1008'],
    language: 'EN',
    notes: 'Инвестор, несколько объектов в работе.',
    trustManagement: true,
  },
];

const starterClients: Client[] = [
  {
    id: 'client-1',
    name: 'Elena Petrova',
    phone: '+995 551 00 11 22',
    telegram: '@elena_tb',
    budget: '900-1300$',
    request: '2 bedroom in Vake or Vera',
    district: 'Vake',
    status: 'Активный поиск',
    agent: 'Nino Beridze',
    notes: 'Нужен лифт и pet friendly.',
  },
  {
    id: 'client-2',
    name: 'Mark Wilson',
    phone: '+995 555 10 20 30',
    telegram: '@mark_tbilisi',
    budget: '200000-280000$',
    request: 'Sale apartment in Vake',
    district: 'Vake',
    status: 'Viewing',
    agent: 'Ana Lomidze',
    notes: 'Interested in new buildings.',
  },
  {
    id: 'client-3',
    name: 'Anna Schmidt',
    phone: '+995 577 12 12 12',
    telegram: '@anna_schmidt',
    budget: '700-1000$',
    request: '1Bed near metro',
    district: 'Saburtalo',
    status: 'Active',
    agent: 'Nino Beridze',
    notes: 'Needs contract for 12 months.',
  },
  {
    id: 'client-4',
    name: 'Giorgi Investor',
    phone: '+995 599 55 44 33',
    telegram: '@giorgi_invest',
    budget: '300000$',
    request: 'Commercial or hotel opportunity',
    district: 'Old Tbilisi',
    status: 'Warm',
    agent: 'David Tibelashvili',
    notes: 'Asks for cap rate.',
  },
  {
    id: 'client-5',
    name: 'Kate Novak',
    phone: '+995 551 91 91 91',
    telegram: '@kate_novak',
    budget: 'Daily 80-120$',
    request: 'Daily rent in old city',
    district: 'Avlabari',
    status: 'New',
    agent: 'Sergi Matchavariani',
    notes: 'Arrives next week.',
  },
];

const starterDeals: Deal[] = [
  {
    id: 'deal-1',
    propertyId: 'RIT-1002',
    client: 'Private buyer',
    owner: 'Mariam Janelidze',
    agent: 'David Tibelashvili',
    dealType: 'Sale',
    amount: '185000$',
    commission: '3%',
    date: '2026-06-28',
    status: 'Закрыта',
    notes: 'Успешная продажа.',
  },
  {
    id: 'deal-2',
    propertyId: 'RIT-1004',
    client: 'Anna Schmidt',
    owner: 'Owner 4',
    agent: 'Nino Beridze',
    dealType: 'Rent',
    amount: '980$',
    commission: '490$',
    date: '2026-07-07',
    status: 'Closed',
    notes: 'Rented this week.',
  },
  {
    id: 'deal-3',
    propertyId: 'RIT-1008',
    client: 'Private buyer',
    owner: 'Saba Kordzaia',
    agent: 'David Tibelashvili',
    dealType: 'Sale',
    amount: '320000$',
    commission: '9600$',
    date: '2026-07-03',
    status: 'Closed',
    notes: 'Premium sale.',
  },
  {
    id: 'deal-4',
    propertyId: 'RIT-1001',
    client: 'Elena Petrova',
    owner: 'Giorgi Maisuradze',
    agent: 'David Tibelashvili',
    dealType: 'Rent',
    amount: '1200$',
    commission: '600$',
    date: '2026-07-02',
    status: 'Signed',
    notes: 'Waiting for payment.',
  },
  {
    id: 'deal-5',
    propertyId: 'RIT-1006',
    client: 'Mark Wilson',
    owner: 'Natia Dolidze',
    agent: 'Ana Lomidze',
    dealType: 'Sale',
    amount: '245000$',
    commission: '7350$',
    date: '2026-07-05',
    status: 'New',
    notes: 'Negotiation stage.',
  },
];

const starterPublications: Publication[] = [
  {
    id: 'pub-1',
    propertyId: 'RIT-1001',
    propertyTitle: 'Beautiful apartment for rent in Vake',
    date: '2026-07-08T09:30:00.000Z',
    author: 'David Tibelashvili',
    channel: 'Demo',
    status: 'Copied',
    text: 'Seed Telegram post',
    photosCount: 3,
  },
  {
    id: 'pub-2',
    propertyId: 'RIT-1005',
    propertyTitle: '2 bedroom apartment in Saburtalo',
    date: '2026-07-07T11:00:00.000Z',
    author: 'Sergi Matchavariani',
    channel: 'Test',
    status: 'Test Published',
    text: 'Seed test channel post',
    photosCount: 1,
    messageLink: 'https://t.me/rentintbilisi_test/1',
  },
  {
    id: 'pub-3',
    propertyId: 'RIT-1006',
    propertyTitle: '3 bedroom apartment in Vake',
    date: '2026-07-03T14:30:00.000Z',
    author: 'Ana Lomidze',
    channel: 'Demo',
    status: 'Draft',
    text: 'Seed draft post',
    photosCount: 1,
  },
  {
    id: 'pub-4',
    propertyId: 'RIT-1008',
    propertyTitle: 'Premium sale in Krtsanisi',
    date: '2026-07-02T17:15:00.000Z',
    author: 'David Tibelashvili',
    channel: 'Production',
    status: 'Production Published',
    text: 'Seed production post',
    photosCount: 1,
    messageLink: 'https://t.me/rentintbilisi/1',
  },
  {
    id: 'pub-5',
    propertyId: 'RIT-1003',
    propertyTitle: 'Cozy apartment near metro',
    date: '2026-06-29T10:45:00.000Z',
    author: 'Nino Beridze',
    channel: 'Demo',
    status: 'Error',
    text: 'Seed failed post',
    photosCount: 1,
    error: 'Backend not connected',
  },
];

const CrmContext = createContext<CrmContextValue | null>(null);

function useCrm() {
  const context = useContext(CrmContext);
  if (!context) throw new Error('useCrm must be used inside CrmContext');
  return context;
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = window.localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

function normalizeBoolean(value: unknown) {
  return value === true || value === 'true' || value === 'Да' || value === 'Allowed';
}

function normalizeDealType(value: unknown): DealType {
  if (value === 'Rent' || value === 'Аренда') return 'Rent';
  if (value === 'Sale' || value === 'Продажа') return 'Sale';
  if (value === 'Daily Rent') return 'Daily Rent';
  return 'Rent';
}

function normalizeCategoryValue(value: unknown): Category {
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
  return map[String(value)] || 'Apartment';
}

function normalizeStatusValue(value: unknown): PropertyStatus {
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
  return map[String(value)] || 'New';
}

function normalizePetPolicy(value: unknown): PetPolicy {
  const map: Record<string, PetPolicy> = {
    Allowed: 'Allowed',
    NotAllowed: 'NotAllowed',
    ByAgreement: 'ByAgreement',
    Да: 'Allowed',
    Нет: 'NotAllowed',
    Обсуждается: 'ByAgreement',
  };
  return map[String(value)] || 'ByAgreement';
}

function mergeById<T extends { id: string }>(saved: T[], seeds: T[]) {
  const ids = new Set(saved.map((item) => item.id));
  return [...saved, ...seeds.filter((item) => !ids.has(item.id))];
}

function normalizeProperty(property: Partial<Property> & Record<string, unknown>, index: number): Property {
  const legacyPhoto = typeof property.photoUrl === 'string' && property.photoUrl ? property.photoUrl : '';
  const photos = Array.isArray(property.photos)
    ? (property.photos as PropertyPhoto[])
    : legacyPhoto
      ? [{ id: `legacy-photo-${index}`, name: 'Legacy photo', src: legacyPhoto, type: 'url' as const }]
      : [];
  const area = String(property.area || '').replace('м2', '').replace('m2', '').trim();
  const price = String(property.price || '').replace('$', '').replace('₾', '').replace('€', '').trim();
  const floorParts = String(property.floor || '').split('/');
  const normalized: Property = {
    ...emptyProperty,
    id: String(property.id || `RIT-${1000 + index}`),
    createdAt: String(property.createdAt || new Date().toISOString()),
    updatedAt: String(property.updatedAt || property.createdAt || new Date().toISOString()),
    dealType: normalizeDealType(property.dealType),
    category: normalizeCategoryValue(property.category),
    city: String(property.city || 'Tbilisi'),
    district: String(property.district || ''),
    metro: String(property.metro || ''),
    address: String(property.address || ''),
    mapLink: String(property.mapLink || ''),
    cadastralCode: String(property.cadastralCode || ''),
    building: String(property.building || ''),
    source: String(property.source || 'Owner'),
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
  };
  return normalized;
}

function normalizeAgent(agent: Partial<Agent>, index: number): Agent {
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

function loadProperties() {
  const saved = readStorage<Partial<Property>[]>(PROPERTY_STORAGE_KEY, seedProperties);
  const normalized = Array.isArray(saved) && saved.length > 0 ? saved.map(normalizeProperty) : seedProperties;
  return mergeById(normalized, seedProperties);
}

function loadAgents() {
  const saved = readStorage<Partial<Agent>[]>(AGENT_STORAGE_KEY, starterAgents);
  const normalized = Array.isArray(saved) && saved.length > 0 ? saved.map(normalizeAgent) : starterAgents;
  return mergeById(normalized, starterAgents);
}

function normalizePublication(publication: Partial<Publication>, index: number): Publication {
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

function normalizeBrandSettings(settings: Partial<BrandSettings>) {
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

function safeNumber(value: string) {
  return Number(value.replace(/[^\d.]/g, '')) || 0;
}

function pricePerM2(property: Pick<Property, 'area' | 'price'>) {
  const area = safeNumber(property.area);
  const price = safeNumber(property.price);
  return area > 0 && price > 0 ? Math.round(price / area) : 0;
}

function priceRangeTag(price: string) {
  const numeric = safeNumber(price);
  if (numeric < 300) return '#Price0to300';
  if (numeric < 500) return '#Price300to500';
  if (numeric < 700) return '#Price500to700';
  if (numeric < 900) return '#Price700to900';
  if (numeric <= 1200) return '#Price900to1200';
  return '#Price1200plus';
}

function minPositive(values: number[]) {
  const filtered = values.filter((value) => Number.isFinite(value) && value > 0);
  return filtered.length ? Math.min(...filtered) : 0;
}

function maxPositive(values: number[]) {
  const filtered = values.filter((value) => Number.isFinite(value) && value > 0);
  return filtered.length ? Math.max(...filtered) : 0;
}

const districtTags: Record<string, string> = {
  Vera: '#Vera',
  Mtatsminda: '#Mtatsminda',
  Vake: '#Vake',
  Sololaki: '#Sololaki',
  Kukia: '#Kukia',
  Nadzaladevi: '#Nadzaladevi',
  Naxalovka: '#Naxalovka',
  'Savnetis Ubani': '#SavnetisUbani',
  Tskneti: '#Tskneti',
  Tskhneti: '#Tskhneti',
  Chugureti: '#Chugureti',
  'Vazha Pshavela': '#VazhaPshavela',
  Nutsubidze: '#Nutsubidze',
  Saburtalo: '#Saburtalo',
  Didube: '#Didube',
  Gldani: '#Gldani',
  Avlabari: '#Avlabari',
  Isani: '#Isani',
  Samgori: '#Samgori',
  Digomi: '#Digomi',
  'Didi Digomi': '#DidiDigomi',
  'Digomi Massive': '#DigomiMassive',
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
  Ponichala: '#Ponichala',
  Avchala: '#Avchala',
  Bagebi: '#Bagebi',
  Lisi: '#Lisi',
  'Old Tbilisi': '#Avlabari',
};

const metroTags: Record<string, string> = {
  'Liberty Square': '#LibertySquare',
  Rustaveli: '#Rustaveli',
  Marjanishvili: '#Marjanishvili',
  'Station Square': '#StationSquare',
  Tsereteli: '#Tsereteli',
  Gotsiridze: '#Gotsiridze',
  Nadzaladevi: '#Nadzaladevi',
  Didube: '#Didube',
  Grmagele: '#Grmagele',
  Guramishvili: '#Guramishvili',
  Sarajishvili: '#Sarajishvili',
  'Ahmeteli Theatre': '#AhmeteliTheatre',
  STUniversity: '#STUniversity',
  'Vazha Pshavela': '#VazhaPshavela',
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

const categoryTags: Record<Category, string> = {
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
  const bedrooms = Math.min(Math.max(Math.round(safeNumber(value)), 1), 4);
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

function cleanTagValue(value: string, fallback: string) {
  const normalized = value.replace(/[^a-zA-Z0-9]/g, '');
  return normalized || fallback;
}

function getMainPhoto(property: Property) {
  return property.photos.find((photo) => photo.id === property.mainPhotoId) || property.photos[0];
}

function statusClassName(status: PropertyStatus) {
  return `status status-${status.toLowerCase().replace(/\s+/g, '-')}`;
}

function formatPrice(property: Property) {
  return property.price ? `${property.price}${property.currency}` : 'Цена по запросу';
}

function getPropertyStats(properties: Property[]) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const monthStart = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  const realized = properties.filter((property) => property.status === 'Rented' || property.status === 'Sold');
  const addedWeek = properties.filter((property) => Date.parse(property.createdAt) >= weekStart).length;
  const addedMonth = properties.filter((property) => Date.parse(property.createdAt) >= monthStart).length;
  const realizedWeek = realized.filter((property) => Date.parse(property.updatedAt) >= weekStart).length;
  const realizedMonth = realized.filter((property) => Date.parse(property.updatedAt) >= monthStart).length;
  return {
    total: properties.length,
    active: properties.filter((property) => !['Rented', 'Sold', 'Archived'].includes(property.status)).length,
    inWork: properties.filter((property) => property.status === 'In Progress').length,
    onAds: properties.filter((property) => property.status === 'On Advertising').length,
    rented: properties.filter((property) => property.status === 'Rented').length,
    sold: properties.filter((property) => property.status === 'Sold').length,
    archived: properties.filter((property) => property.status === 'Archived').length,
    exclusive: properties.filter((property) => property.exclusive).length,
    rentedToday: properties.filter((property) => property.status === 'Rented' && Date.parse(property.updatedAt) >= todayStart).length,
    rentedWeek: properties.filter((property) => property.status === 'Rented' && Date.parse(property.updatedAt) >= weekStart).length,
    rentedMonth: properties.filter((property) => property.status === 'Rented' && Date.parse(property.updatedAt) >= monthStart).length,
    soldWeek: properties.filter((property) => property.status === 'Sold' && Date.parse(property.updatedAt) >= weekStart).length,
    soldMonth: properties.filter((property) => property.status === 'Sold' && Date.parse(property.updatedAt) >= monthStart).length,
    addedWeek,
    addedMonth,
    realizedWeek,
    realizedMonth,
    conversionRate: properties.length ? Math.round((realized.length / properties.length) * 100) : 0,
  };
}

function getDistricts(properties: Property[]) {
  return Array.from(new Set(properties.map((property) => property.district).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function thisWeekCount(publications: Publication[]) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return publications.filter((publication) => Date.parse(publication.date) >= weekAgo).length;
}

function thisMonthCount(publications: Publication[]) {
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return publications.filter((publication) => Date.parse(publication.date) >= monthAgo).length;
}

function average(values: number[]) {
  const filtered = values.filter((value) => Number.isFinite(value) && value > 0);
  return filtered.length ? Math.round(filtered.reduce((sum, value) => sum + value, 0) / filtered.length) : 0;
}

function median(values: number[]) {
  const filtered = values.filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
  if (!filtered.length) return 0;
  const middle = Math.floor(filtered.length / 2);
  return filtered.length % 2 ? filtered[middle] : Math.round((filtered[middle - 1] + filtered[middle]) / 2);
}

function districtAnalytics(properties: Property[]) {
  return getDistricts(properties).map((district) => {
    const districtProperties = properties.filter((property) => property.district === district);
    const rent = districtProperties.filter((property) => property.dealType === 'Rent');
    const sale = districtProperties.filter((property) => property.dealType === 'Sale');
    const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return {
      district,
      rentCount: rent.length,
      avgRent: average(rent.map((property) => safeNumber(property.price))),
      medianRent: median(rent.map((property) => safeNumber(property.price))),
      minRent: minPositive(rent.map((property) => safeNumber(property.price))),
      maxRent: maxPositive(rent.map((property) => safeNumber(property.price))),
      avgRentM2: average(rent.map(pricePerM2)),
      saleCount: sale.length,
      avgSale: average(sale.map((property) => safeNumber(property.price))),
      medianSale: median(sale.map((property) => safeNumber(property.price))),
      avgSaleM2: average(sale.map(pricePerM2)),
      avg1Bed: average(rent.filter((property) => property.bedrooms === '1').map((property) => safeNumber(property.price))),
      avg2Bed: average(rent.filter((property) => property.bedrooms === '2').map((property) => safeNumber(property.price))),
      avg3Bed: average(rent.filter((property) => property.bedrooms === '3').map((property) => safeNumber(property.price))),
      realizedMonth: districtProperties.filter(
        (property) => ['Rented', 'Sold'].includes(property.status) && Date.parse(property.updatedAt) >= monthAgo,
      ).length,
    };
  });
}

function agentAnalytics(agents: Agent[], properties: Property[], deals: Deal[], publications: Publication[]) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return agents
    .map((agent) => {
      const agentProperties = properties.filter((property) => property.agent === agent.name);
      const agentDeals = deals.filter((deal) => deal.agent === agent.name);
      const realized = agentProperties.filter((property) => ['Rented', 'Sold'].includes(property.status));
      const commissions = agentDeals.map((deal) => safeNumber(deal.commission));
      return {
        ...agent,
        objects: agentProperties.length,
        exclusives: agentProperties.filter((property) => property.exclusive).length,
        rented: agentProperties.filter((property) => property.status === 'Rented').length,
        sold: agentProperties.filter((property) => property.status === 'Sold').length,
        deals: agentDeals.length,
        commissionSum: commissions.reduce((sum, value) => sum + value, 0),
        avgCommission: average(commissions),
        conversion: agentProperties.length ? Math.round((realized.length / agentProperties.length) * 100) : 0,
        weekActivity: agentProperties.filter((property) => Date.parse(property.updatedAt) >= weekAgo).length,
        monthActivity: agentProperties.filter((property) => Date.parse(property.updatedAt) >= monthAgo).length,
        publications: publications.filter((publication) => publication.author === agent.name).length,
      };
    })
    .sort((a, b) => b.commissionSum - a.commissionSum || b.exclusives - a.exclusives);
}

function buildTelegramPost(property: Property, settings: BrandSettings, language: PostLanguage, forcedDealType?: DealType) {
  const dealType = forcedDealType || property.dealType;
  const districtTag = tagFromMap(districtTags, property.district) || '#OutOfTown';
  const metroTag = tagFromMap(metroTags, property.metro);
  const floor = property.floor && property.totalFloors ? `${property.floor}/${property.totalFloors} Floor` : '';
  const primaryLineTags = [bedTag(property.bedrooms), categoryTags[property.category], 'for', dealTag(dealType)].join(' ');
  const amenityRows = [
    [property.balcony && '#Balcony', property.internet && '#WiFi', property.tv && '#TV'],
    [property.stove && '#Stove', property.vacuumCleaner && '#VacuumCleaner'],
    [property.elevator && '#Elevator', property.oven && '#Oven'],
    [property.parking && '#ParkingPlace'],
    [property.airConditioner && '#Conditioner'],
  ]
    .map((row) => row.filter(Boolean).map((tag) => `✅ ${tag}`).join(' '))
    .filter(Boolean);
  const heatingTag = `#${cleanTagValue(property.heating, 'CentralHeating')}`;
  const showerTag = property.shower ? ' | #Shower' : '';
  const money =
    dealType === 'Rent' || dealType === 'Daily Rent'
      ? `${property.price}${property.currency} + Deposit ${property.deposit || property.price}${property.currency}`
      : `${property.price}${property.currency}`;
  const contact = property.publicationContact || settings.mainContact;
  const contactSignature = language === 'RU' ? settings.defaultSignature : settings.defaultSignature;

  return [
    `${districtTag}${metroTag ? ` 🚇 ${metroTag}` : ''}`,
    `📍${property.address}`,
    '',
    ...(property.exclusive ? ['❗️#Exclusive', ''] : []),
    `🏢 ${primaryLineTags}`,
    `✨ #${property.buildingType} | #${property.renovation}`,
    `🏠${property.area || '-'} sq.m | ${floor || '-'} |`,
    `${heatingTag}${showerTag}`,
    '',
    ...amenityRows,
    '',
    `👫Tenants: ${property.tenantsCount || '1-4'}`,
    `🐕Pets: ${petTag(property.petPolicy)}`,
    '',
    `💰${money}`,
    ...(settings.includeZeroCommission ? ['0% Commission'] : []),
    priceRangeTag(property.price),
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

function AppProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(loadProperties);
  const [agents] = useState<Agent[]>(loadAgents);
  const [owners] = useState<Owner[]>(() => mergeById(readStorage<Owner[]>(OWNER_STORAGE_KEY, starterOwners), starterOwners));
  const [clients] = useState<Client[]>(() => mergeById(readStorage<Client[]>(CLIENT_STORAGE_KEY, starterClients), starterClients));
  const [deals] = useState<Deal[]>(() => mergeById(readStorage<Deal[]>(DEAL_STORAGE_KEY, starterDeals), starterDeals));
  const [publications, setPublications] = useState<Publication[]>(() =>
    mergeById(readStorage<Partial<Publication>[]>(PUBLICATION_STORAGE_KEY, starterPublications).map(normalizePublication), starterPublications),
  );
  const [brandSettings, setBrandSettingsState] = useState<BrandSettings>(() =>
    normalizeBrandSettings(readStorage<Partial<BrandSettings>>(SETTINGS_STORAGE_KEY, defaultBrandSettings)),
  );
  const [session, setSessionState] = useState<Session | null>(() =>
    readStorage<Session | null>(SESSION_STORAGE_KEY, null),
  );
  const [theme, setThemeState] = useState<ThemeMode>(() => readStorage<ThemeMode>(THEME_STORAGE_KEY, 'light'));
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    window.localStorage.setItem(PROPERTY_STORAGE_KEY, JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    window.localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    window.localStorage.setItem(OWNER_STORAGE_KEY, JSON.stringify(owners));
  }, [owners]);

  useEffect(() => {
    window.localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    window.localStorage.setItem(DEAL_STORAGE_KEY, JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    window.localStorage.setItem(PUBLICATION_STORAGE_KEY, JSON.stringify(publications));
  }, [publications]);

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(brandSettings));
  }, [brandSettings]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  }, [theme]);

  function showToast(message: string, tone: Toast['tone'] = 'success') {
    const toast = { id: crypto.randomUUID(), message, tone };
    setToasts((current) => [toast, ...current].slice(0, 3));
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== toast.id));
    }, 2600);
  }

  function setSession(nextSession: Session | null) {
    setSessionState(nextSession);
    if (nextSession) window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    else window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  function upsertProperty(nextProperty: Property) {
    setProperties((current) => {
      const exists = current.some((property) => property.id === nextProperty.id);
      if (!exists) return [nextProperty, ...current];
      return current.map((property) => (property.id === nextProperty.id ? nextProperty : property));
    });
  }

  function deleteProperty(id: string) {
    setProperties((current) => current.filter((property) => property.id !== id));
  }

  function addPublication(publication: Publication) {
    setPublications((current) => [publication, ...current]);
  }

  function setBrandSettings(settings: BrandSettings) {
    setBrandSettingsState(settings);
  }

  const value = useMemo(
    () => ({
      agents,
      brandSettings,
      clients,
      deals,
      deleteProperty,
      owners,
      properties,
      publications,
      session,
      setBrandSettings,
      setSession,
      setTheme: setThemeState,
      showToast,
      theme,
      upsertProperty,
      addPublication,
    }),
    [agents, brandSettings, clients, deals, owners, properties, publications, session, theme],
  );

  return (
    <CrmContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} />
    </CrmContext.Provider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/new" element={<PropertyFormPage mode="create" />} />
            <Route path="/properties/:propertyId" element={<PropertyDetailPage />} />
            <Route path="/properties/:propertyId/edit" element={<PropertyFormPage mode="edit" />} />
            <Route path="/post-preview" element={<PostPreviewPage />} />
            <Route path="/telegram" element={<TelegramPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agents/:agentId" element={<AgentDetailPage />} />
            <Route path="/owners" element={<OwnersPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/districts" element={<DistrictsPage />} />
            <Route path="/publications" element={<PublicationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'logo compactLogo' : 'logo'}>
      <span className="logoMark">M</span>
      <div>
        <strong>Molecula</strong>
        <span>Rent in Tbilisi</span>
      </div>
    </div>
  );
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toastStack" aria-live="polite">
      {toasts.map((toast) => (
        <div className={`toast toast-${toast.tone}`} key={toast.id}>
          <Check size={16} />
          {toast.message}
        </div>
      ))}
    </div>
  );
}

function LoginPage() {
  const { session, setSession, setTheme, theme } = useCrm();
  const navigate = useNavigate();
  const [name, setName] = useState('David Tibelashvili');
  const [role, setRole] = useState<AuthRole>('Администратор');

  useEffect(() => {
    if (session) navigate('/', { replace: true });
  }, [navigate, session]);

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSession({ name: name.trim() || role, role });
    navigate('/', { replace: true });
  }

  return (
    <main className="loginPage">
      <section className="loginPanel">
        <Logo />
        <div className="loginCopy">
          <p className="eyebrow">Private real estate operating system</p>
          <h1>Операционная система доверия для Rent in Tbilisi</h1>
          <p>Объекты, публикации, команда и сделки в одном премиальном рабочем пространстве.</p>
        </div>
        <form className="loginForm" onSubmit={login}>
          <label>
            Имя
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Роль
            <select value={role} onChange={(event) => setRole(event.target.value as AuthRole)}>
              {authRoles.map((authRole) => (
                <option key={authRole}>{authRole}</option>
              ))}
            </select>
          </label>
          <button className="primaryButton fullWidth" type="submit">
            <KeyRound size={18} />
            Войти в Molecula CRM
          </button>
        </form>
        <button className="ghostButton fullWidth" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} type="button">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
        </button>
      </section>
    </main>
  );
}

function ProtectedLayout() {
  const { session, setSession, setTheme, theme } = useCrm();
  const navigate = useNavigate();

  if (!session) return <Navigate to="/login" replace />;

  function logout() {
    setSession(null);
    navigate('/login', { replace: true });
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <Link className="brandLink" to="/">
          <Logo />
        </Link>

        <nav className="navigation" aria-label="Основные разделы">
          <NavItem icon={LayoutDashboard} label="Dashboard" to="/" />
          <NavItem icon={Building2} label="Объекты" to="/properties" />
          <NavItem icon={Plus} label="Добавить объект" to="/properties/new" />
          <NavItem icon={Smartphone} label="Предпросмотр поста" to="/post-preview" />
          <NavItem icon={MessageCircle} label="Telegram" to="/telegram" />
          <NavItem icon={UsersRound} label="Агенты" to="/agents" />
          <NavItem icon={Home} label="Собственники" to="/owners" />
          <NavItem icon={UserRound} label="Клиенты" to="/clients" />
          <NavItem icon={Handshake} label="Сделки" to="/deals" />
          <NavItem icon={BarChart3} label="Аналитика" to="/analytics" />
          <NavItem icon={Building2} label="Районы и цены" to="/districts" />
          <NavItem icon={FileText} label="Публикации" to="/publications" />
          <NavItem icon={Settings} label="Настройки" to="/settings" />
        </nav>

        <div className="sidebarFooter">
          <div className="profileBox">
            <span className="avatar">{initials(session.name)}</span>
            <div>
              <strong>{session.name}</strong>
              <span>{session.role}</span>
            </div>
          </div>
          <div className="sidebarActions">
            <button className="iconButton" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} type="button">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="iconButton" onClick={logout} type="button">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, to }: { icon: typeof Building2; label: string; to: string }) {
  return (
    <NavLink className={({ isActive }) => (isActive ? 'navButton active' : 'navButton')} end={to === '/'} to={to}>
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

function PageFrame({ actions, children }: { actions?: ReactNode; children: ReactNode }) {
  const { session } = useCrm();
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <div className="pageFrame">
      <header className="moleculaHeader">
        <div>
          <p className="eyebrow">Molecula CRM / Rent in Tbilisi</p>
          <h1>{title}</h1>
        </div>
        <div className="headerActions">
          {actions}
          <div className="topbarMeta">
            <ShieldCheck size={18} />
            <span>{session?.role}</span>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

function getPageTitle(pathname: string) {
  if (pathname.startsWith('/properties/new')) return 'Добавить объект';
  if (pathname.startsWith('/properties') && pathname.endsWith('/edit')) return 'Редактирование объекта';
  if (pathname.startsWith('/properties/')) return 'Карточка объекта';
  if (pathname.startsWith('/properties')) return 'Объекты';
  if (pathname.startsWith('/post-preview')) return 'Предпросмотр поста';
  if (pathname.startsWith('/telegram')) return 'Telegram публикация';
  if (pathname.startsWith('/agents/')) return 'Карточка агента';
  if (pathname.startsWith('/agents')) return 'Агенты';
  if (pathname.startsWith('/owners')) return 'Собственники';
  if (pathname.startsWith('/clients')) return 'Клиенты';
  if (pathname.startsWith('/deals')) return 'Сделки';
  if (pathname.startsWith('/analytics')) return 'Аналитика';
  if (pathname.startsWith('/districts')) return 'Районы и цены';
  if (pathname.startsWith('/publications')) return 'Публикации';
  if (pathname.startsWith('/settings')) return 'Настройки бренда';
  return 'Dashboard';
}

function DashboardPage() {
  const { agents, deals, properties, publications } = useCrm();
  const stats = getPropertyStats(properties);
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const monthCommission = deals
    .filter((deal) => Date.parse(deal.date) >= monthAgo)
    .reduce((sum, deal) => sum + safeNumber(deal.commission), 0);
  const recentProperties = [...properties].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 4);
  const cards = [
    { label: 'Всего объектов', value: stats.total, icon: Building2 },
    { label: 'Активные', value: stats.active, icon: BarChart3 },
    { label: 'На рекламе', value: stats.onAds, icon: Sparkles },
    { label: 'Эксклюзивы', value: stats.exclusive, icon: ShieldCheck },
    { label: 'Сдано за неделю', value: stats.rentedWeek, icon: Check },
    { label: 'Сдано за месяц', value: stats.rentedMonth, icon: Check },
    { label: 'Продано за месяц', value: stats.soldMonth, icon: Handshake },
    { label: 'Добавлено за неделю', value: stats.addedWeek, icon: Plus },
    { label: 'Реализовано за неделю', value: stats.realizedWeek, icon: Handshake },
    { label: 'Комиссия за месяц', value: `${monthCommission}$`, icon: Sparkles },
    { label: 'Активные агенты', value: agents.filter((agent) => agent.isActive).length, icon: UsersRound },
    { label: 'Публикации за неделю', value: thisWeekCount(publications), icon: MessageCircle },
  ];

  return (
    <PageFrame
      actions={
        <div className="quickActions">
          <Link className="secondaryButton" to="/post-preview">
            <Smartphone size={18} />
            Создать пост
          </Link>
          <Link className="secondaryButton" to="/analytics">
            <BarChart3 size={18} />
            Открыть аналитику
          </Link>
          <Link className="primaryButton" to="/properties/new">
            <Plus size={18} />
            Добавить объект
          </Link>
        </div>
      }
    >
      <section className="heroPanel premiumHero">
        <div>
          <p className="eyebrow">Trust operations for premium real estate</p>
          <h2>Molecula соединяет объекты, людей и публикации</h2>
          <p>Рабочий центр для Rent in Tbilisi: база объектов, фото, Telegram-шаблоны, команда и история публикаций.</p>
        </div>
        <a className="secondaryButton" href="https://web.telegram.org/" target="_blank" rel="noreferrer">
          <ExternalLink size={18} />
          Открыть Telegram
        </a>
      </section>

      <section className="metrics dashboardMetrics">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label}>
              <span>
                <Icon size={17} />
                {card.label}
              </span>
              <strong>{card.value}</strong>
            </article>
          );
        })}
      </section>

      <section className="workspace">
        <div className="sectionHeader">
          <div>
            <h2>Последние добавленные объекты</h2>
            <p>Быстрый контроль объектов перед рекламой и публикацией.</p>
          </div>
          <Link className="secondaryButton" to="/properties">
            Все объекты
          </Link>
        </div>
        <PropertyCardGrid properties={recentProperties} />
      </section>
    </PageFrame>
  );
}

function PropertyStats({ properties }: { properties: Property[] }) {
  const stats = getPropertyStats(properties);
  const items = [
    { label: 'Всего', value: stats.total },
    { label: 'Активные', value: stats.active },
    { label: 'В работе', value: stats.inWork },
    { label: 'На рекламе', value: stats.onAds },
    { label: 'Сдано', value: stats.rented },
    { label: 'Продано', value: stats.sold },
    { label: 'Архив', value: stats.archived },
  ];

  return (
    <section className="metrics compactMetrics" aria-label="Статистика объектов">
      {items.map((item) => (
        <article key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </article>
      ))}
    </section>
  );
}

function PropertiesPage() {
  const { deleteProperty, properties, showToast } = useCrm();
  const [addressQuery, setAddressQuery] = useState('');
  const [district, setDistrict] = useState('Все районы');
  const [dealType, setDealType] = useState('Все типы');
  const [status, setStatus] = useState('Все статусы');
  const [deleteCandidate, setDeleteCandidate] = useState<Property | null>(null);

  const districts = useMemo(() => getDistricts(properties), [properties]);
  const filteredProperties = useMemo(() => {
    const normalizedAddress = addressQuery.trim().toLowerCase();
    return properties.filter((property) => {
      const matchesAddress = property.address.toLowerCase().includes(normalizedAddress);
      const matchesDistrict = district === 'Все районы' || property.district === district;
      const matchesDealType = dealType === 'Все типы' || property.dealType === dealType;
      const matchesStatus = status === 'Все статусы' || property.status === status;
      return matchesAddress && matchesDistrict && matchesDealType && matchesStatus;
    });
  }, [addressQuery, dealType, district, properties, status]);

  function confirmDelete() {
    if (!deleteCandidate) return;
    deleteProperty(deleteCandidate.id);
    showToast('Объект удален', 'warning');
    setDeleteCandidate(null);
  }

  return (
    <PageFrame
      actions={
        <Link className="primaryButton" to="/properties/new">
          <Plus size={18} />
          Добавить объект
        </Link>
      }
    >
      <PropertyStats properties={properties} />

      <section className="workspace">
        <div className="sectionHeader">
          <div>
            <h2>Рабочая база объектов</h2>
            <p>Фильтры, фото, статус рекламы и готовность к Telegram-публикации.</p>
          </div>
        </div>

        <div className="filtersPanel">
          <label className="searchBox">
            <Search size={18} />
            <input
              aria-label="Поиск по адресу"
              onChange={(event) => setAddressQuery(event.target.value)}
              placeholder="Поиск по адресу"
              value={addressQuery}
            />
          </label>
          <label>
            Район
            <select value={district} onChange={(event) => setDistrict(event.target.value)}>
              <option>Все районы</option>
              {districts.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Тип сделки
            <select value={dealType} onChange={(event) => setDealType(event.target.value)}>
              <option>Все типы</option>
              {dealTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Статус
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>Все статусы</option>
              {propertyStatuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <PropertyCardGrid properties={filteredProperties} onDelete={setDeleteCandidate} />

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Объект</th>
                <th>Район</th>
                <th>Тип</th>
                <th>Цена</th>
                <th>Цена / м²</th>
                <th>Площадь</th>
                <th>Статус</th>
                <th>Агент</th>
                <th>Фото</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => (
                <tr key={property.id}>
                  <td>{property.id}</td>
                  <td>
                    <Link to={`/properties/${property.id}`}>
                      <strong>{property.titleRu || property.address}</strong>
                    </Link>
                    <span>{property.address}</span>
                  </td>
                  <td>{property.district}</td>
                  <td>{property.dealType}</td>
                  <td>{formatPrice(property)}</td>
                  <td>{pricePerM2(property) ? `${pricePerM2(property)}${property.currency}` : '-'}</td>
                  <td>{property.area || '-'} м²</td>
                  <td>
                    <span className={statusClassName(property.status)}>{property.status}</span>
                  </td>
                  <td>{property.agent || '-'}</td>
                  <td>{property.photos.length}</td>
                  <td>
                    <div className="rowActions">
                      <Link className="iconButton" to={`/properties/${property.id}/edit`} aria-label="Редактировать">
                        <Pencil size={16} />
                      </Link>
                      <Link className="iconButton" to={`/post-preview?property=${property.id}`} aria-label="Пост">
                        <Smartphone size={16} />
                      </Link>
                      <button className="iconButton danger" onClick={() => setDeleteCandidate(property)} type="button">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProperties.length === 0 && <EmptyState title="Объекты не найдены" text="Измените фильтры или добавьте новый объект." />}
      </section>

      <ConfirmDialog
        isOpen={Boolean(deleteCandidate)}
        title="Удалить объект?"
        text={`Объект "${deleteCandidate?.address || ''}" будет удален из локальной базы.`}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={confirmDelete}
      />
    </PageFrame>
  );
}

function PropertyCardGrid({ onDelete, properties }: { onDelete?: (property: Property) => void; properties: Property[] }) {
  if (properties.length === 0) {
    return <EmptyState title="Нет объектов" text="Когда появятся объекты, они будут отображаться здесь красивыми карточками." />;
  }
  return (
    <div className="propertyCards">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} onDelete={onDelete} />
      ))}
    </div>
  );
}

function PropertyCard({ onDelete, property }: { onDelete?: (property: Property) => void; property: Property }) {
  const mainPhoto = getMainPhoto(property);
  return (
    <article className="propertyCard">
      <Link className="propertyMedia" to={`/properties/${property.id}`}>
        {mainPhoto ? <img alt={property.titleEn || property.address} src={mainPhoto.src} /> : <Camera size={32} />}
        <span className={statusClassName(property.status)}>{property.status}</span>
      </Link>
      <div className="propertyCardBody">
        <div className="cardTopline">
          <span>{property.id}</span>
          <strong>{formatPrice(property)}</strong>
        </div>
        <Link className="cardTitle" to={`/properties/${property.id}`}>
          {property.titleEn || property.titleRu || property.address}
        </Link>
        <p>{property.address}</p>
        <div className="propertyFacts">
          <span>{property.district}</span>
          <span>{property.area || '-'} м²</span>
          <span>{pricePerM2(property) ? `${pricePerM2(property)}${property.currency}/м²` : '-/м²'}</span>
          <span>{property.bedrooms || '-'} bed</span>
          <span>{property.floor || '-'}/{property.totalFloors || '-'}</span>
        </div>
        <div className="cardActions">
          <Link className="secondaryButton" to={`/post-preview?property=${property.id}`}>
            <Smartphone size={16} />
            Пост
          </Link>
          <Link className="ghostButton" to={`/properties/${property.id}/edit`}>
            <Pencil size={16} />
            Изменить
          </Link>
          {onDelete && (
            <button className="ghostButton dangerText" onClick={() => onDelete(property)} type="button">
              <Trash2 size={16} />
              Удалить
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function PropertyDetailPage() {
  const { deleteProperty, properties, showToast } = useCrm();
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const property = properties.find((item) => item.id === propertyId);

  if (!property) {
    return (
      <PageFrame>
        <NotFoundPanel title="Объект не найден" backTo="/properties" />
      </PageFrame>
    );
  }

  function confirmDelete() {
    if (!property) return;
    deleteProperty(property.id);
    showToast('Объект удален', 'warning');
    navigate('/properties');
  }

  return (
    <PageFrame
      actions={
        <div className="quickActions">
          <Link className="secondaryButton" to={`/post-preview?property=${property.id}`}>
            <Smartphone size={18} />
            Telegram post
          </Link>
          <Link className="primaryButton" to={`/properties/${property.id}/edit`}>
            <Pencil size={18} />
            Редактировать
          </Link>
        </div>
      }
    >
      <Link className="backLink" to="/properties">
        <ArrowLeft size={16} />
        Объекты
      </Link>
      <section className="detailLayout">
        <div className="workspace">
          <ObjectGallery property={property} />
          <div className="detailHeader">
            <div>
              <span className={statusClassName(property.status)}>{property.status}</span>
              <h2>{property.titleRu || property.address}</h2>
              <p>{property.descriptionRu || property.internalNotes}</p>
            </div>
            <strong className="detailPrice">{formatPrice(property)}</strong>
          </div>
          <div className="detailGrid">
            <InfoItem label="ID объекта" value={property.id} />
            <InfoItem label="Район / метро" value={`${property.district} / ${property.metro || '-'}`} />
            <InfoItem label="Адрес" value={property.address} />
            <InfoItem label="Категория" value={property.category} />
            <InfoItem label="Площадь" value={`${property.area || '-'} м²`} />
            <InfoItem label="Цена за м²" value={pricePerM2(property) ? `${pricePerM2(property)}${property.currency}` : '-'} />
            <InfoItem label="Спальни / комнаты" value={`${property.bedrooms || '-'} / ${property.rooms || '-'}`} />
            <InfoItem label="Этаж" value={`${property.floor || '-'}/${property.totalFloors || '-'}`} />
            <InfoItem label="Комиссия клиента" value={property.clientCommission} />
            <InfoItem label="Собственник" value={property.owner || '-'} />
            <InfoItem label="Телефон собственника" value={property.ownerPhone || '-'} />
            <InfoItem label="Telegram собственника" value={property.ownerTelegram || '-'} />
            <InfoItem label="Эксклюзив" value={property.exclusive ? 'Да' : 'Нет'} />
          </div>
        </div>
        <aside className="workspace compact">
          <h2>Операции</h2>
          <div className="stackedActions">
            <Link className="primaryButton fullWidth" to={`/properties/${property.id}/edit`}>
              <Pencil size={18} />
              Редактировать
            </Link>
            <button className="secondaryButton fullWidth dangerText" onClick={() => setConfirmOpen(true)} type="button">
              <Trash2 size={18} />
              Удалить объект
            </button>
          </div>
        </aside>
      </section>
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Удалить объект?"
        text={`Объект "${property.address}" будет удален из локальной базы.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </PageFrame>
  );
}

function ObjectGallery({ property }: { property: Property }) {
  const mainPhoto = getMainPhoto(property);
  return (
    <div className="objectGallery">
      <div className="mainPhoto">
        {mainPhoto ? <img alt={mainPhoto.name} src={mainPhoto.src} /> : <Camera size={42} />}
      </div>
      <div className="thumbGrid">
        {property.photos.slice(0, 4).map((photo) => (
          <img alt={photo.name} className={photo.id === property.mainPhotoId ? 'selectedThumb' : ''} key={photo.id} src={photo.src} />
        ))}
        {property.photos.length === 0 && <span>Фото еще не загружены</span>}
      </div>
    </div>
  );
}

function PropertyFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { properties, showToast, upsertProperty } = useCrm();
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const existingProperty = properties.find((property) => property.id === propertyId);
  const [form, setForm] = useState<PropertyFormState>(
    mode === 'edit' && existingProperty
      ? {
          dealType: existingProperty.dealType,
          category: existingProperty.category,
          city: existingProperty.city,
          district: existingProperty.district,
          metro: existingProperty.metro,
          address: existingProperty.address,
          mapLink: existingProperty.mapLink,
          cadastralCode: existingProperty.cadastralCode,
          building: existingProperty.building,
          source: existingProperty.source,
          titleRu: existingProperty.titleRu,
          titleEn: existingProperty.titleEn,
          descriptionRu: existingProperty.descriptionRu,
          descriptionEn: existingProperty.descriptionEn,
          price: existingProperty.price,
          currency: existingProperty.currency,
          area: existingProperty.area,
          bedrooms: existingProperty.bedrooms,
          rooms: existingProperty.rooms,
          floor: existingProperty.floor,
          totalFloors: existingProperty.totalFloors,
          tenantsCount: existingProperty.tenantsCount,
          buildingType: existingProperty.buildingType,
          renovation: existingProperty.renovation,
          heating: existingProperty.heating,
          airConditioner: existingProperty.airConditioner,
          balcony: existingProperty.balcony,
          elevator: existingProperty.elevator,
          parking: existingProperty.parking,
          dishwasher: existingProperty.dishwasher,
          oven: existingProperty.oven,
          stove: existingProperty.stove,
          tv: existingProperty.tv,
          vacuumCleaner: existingProperty.vacuumCleaner,
          shower: existingProperty.shower,
          fridge: existingProperty.fridge,
          washingMachine: existingProperty.washingMachine,
          internet: existingProperty.internet,
          petPolicy: existingProperty.petPolicy,
          rentalTerm: existingProperty.rentalTerm,
          deposit: existingProperty.deposit,
          clientCommission: '0%',
          ownerCommission: existingProperty.ownerCommission,
          taxIncluded: existingProperty.taxIncluded,
          agent: existingProperty.agent,
          operator: existingProperty.operator,
          publicationContact: existingProperty.publicationContact,
          owner: existingProperty.owner,
          ownerPhone: existingProperty.ownerPhone,
          ownerTelegram: existingProperty.ownerTelegram,
          status: existingProperty.status,
          exclusive: existingProperty.exclusive,
          internalNotes: existingProperty.internalNotes,
          photos: existingProperty.photos,
          mainPhotoId: existingProperty.mainPhotoId,
          videoUrl: existingProperty.videoUrl,
        }
      : emptyProperty,
  );
  const [photoUrl, setPhotoUrl] = useState('');

  if (mode === 'edit' && !existingProperty) {
    return (
      <PageFrame>
        <NotFoundPanel title="Объект не найден" backTo="/properties" />
      </PageFrame>
    );
  }

  function updateField<Field extends keyof PropertyFormState>(field: Field, value: PropertyFormState[Field]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    const uploadedPhotos = await Promise.all(files.map(fileToPhoto));
    setForm((current) => ({
      ...current,
      photos: [...current.photos, ...uploadedPhotos],
      mainPhotoId: current.mainPhotoId || uploadedPhotos[0]?.id || '',
    }));
    event.target.value = '';
  }

  function addUrlPhoto() {
    const url = photoUrl.trim();
    if (!url) return;
    const photo: PropertyPhoto = { id: crypto.randomUUID(), name: 'URL photo', src: url, type: 'url' };
    setForm((current) => ({
      ...current,
      photos: [...current.photos, photo],
      mainPhotoId: current.mainPhotoId || photo.id,
    }));
    setPhotoUrl('');
  }

  function removePhoto(photoId: string) {
    setForm((current) => {
      const photos = current.photos.filter((photo) => photo.id !== photoId);
      return {
        ...current,
        photos,
        mainPhotoId: current.mainPhotoId === photoId ? photos[0]?.id || '' : current.mainPhotoId,
      };
    });
  }

  function saveProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const now = new Date().toISOString();
    const property: Property = {
      ...form,
      id: existingProperty?.id || `RIT-${Date.now().toString().slice(-6)}`,
      createdAt: existingProperty?.createdAt || now,
      updatedAt: now,
      titleRu: form.titleRu.trim() || `${form.category} ${form.dealType === 'Sale' ? 'на продажу' : 'в аренду'} в ${form.district}`,
      titleEn:
        form.titleEn.trim() ||
        `Beautiful ${form.category.toLowerCase()} for ${form.dealType === 'Sale' ? 'sale' : 'rent'} in ${form.district}`,
      address: form.address.trim(),
      district: form.district.trim(),
      price: form.price.trim(),
      area: form.area.trim(),
      city: form.city.trim(),
      mapLink: form.mapLink.trim(),
      cadastralCode: form.cadastralCode.trim(),
      source: form.source.trim(),
      agent: form.agent.trim(),
      operator: form.operator.trim(),
      publicationContact: form.publicationContact.trim(),
      owner: form.owner.trim(),
      ownerPhone: form.ownerPhone.trim(),
      ownerTelegram: form.ownerTelegram.trim(),
      mainPhotoId: form.mainPhotoId || form.photos[0]?.id || '',
      videoUrl: form.videoUrl.trim(),
    };
    upsertProperty(property);
    showToast(mode === 'create' ? 'Объект сохранен' : 'Изменения сохранены');
    navigate(`/properties/${property.id}`);
  }

  return (
    <PageFrame
      actions={
        <Link className="secondaryButton" to={existingProperty ? `/properties/${existingProperty.id}` : '/properties'}>
          Отмена
        </Link>
      }
    >
      <form className="workspace propertyForm" onSubmit={saveProperty}>
        <FormSection title="Основное">
          <label>
            Тип сделки
            <select value={form.dealType} onChange={(event) => updateField('dealType', event.target.value as DealType)}>
              {dealTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Категория
            <select value={form.category} onChange={(event) => updateField('category', event.target.value as Category)}>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Город
            <input value={form.city} onChange={(event) => updateField('city', event.target.value)} />
          </label>
          <label>
            Район
            <input required value={form.district} onChange={(event) => updateField('district', event.target.value)} />
          </label>
          <label>
            Метро
            <input value={form.metro} onChange={(event) => updateField('metro', event.target.value)} />
          </label>
          <label className="wideField">
            Адрес
            <input required value={form.address} onChange={(event) => updateField('address', event.target.value)} />
          </label>
          <label>
            Источник объекта
            <input value={form.source} onChange={(event) => updateField('source', event.target.value)} />
          </label>
          <label>
            Ссылка на карту
            <input value={form.mapLink} onChange={(event) => updateField('mapLink', event.target.value)} />
          </label>
          <label>
            Кадастровый код
            <input value={form.cadastralCode} onChange={(event) => updateField('cadastralCode', event.target.value)} />
          </label>
          <label>
            Комплекс / здание
            <input value={form.building} onChange={(event) => updateField('building', event.target.value)} />
          </label>
          <label>
            Статус
            <select value={form.status} onChange={(event) => updateField('status', event.target.value as PropertyStatus)}>
              {propertyStatuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </FormSection>

        <FormSection title="Описание">
          <label className="wideField">
            Заголовок RU
            <input value={form.titleRu} onChange={(event) => updateField('titleRu', event.target.value)} />
          </label>
          <label className="wideField">
            Заголовок EN
            <input value={form.titleEn} onChange={(event) => updateField('titleEn', event.target.value)} />
          </label>
          <label className="wideField">
            Описание RU
            <textarea rows={4} value={form.descriptionRu} onChange={(event) => updateField('descriptionRu', event.target.value)} />
          </label>
          <label className="wideField">
            Описание EN
            <textarea rows={4} value={form.descriptionEn} onChange={(event) => updateField('descriptionEn', event.target.value)} />
          </label>
        </FormSection>

        <FormSection title="Параметры и цена">
          <label>
            Цена
            <input required value={form.price} onChange={(event) => updateField('price', event.target.value)} />
          </label>
          <label>
            Валюта
            <select value={form.currency} onChange={(event) => updateField('currency', event.target.value as Currency)}>
              {currencies.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Площадь м²
            <input value={form.area} onChange={(event) => updateField('area', event.target.value)} />
          </label>
          <label>
            Спальни
            <input value={form.bedrooms} onChange={(event) => updateField('bedrooms', event.target.value)} />
          </label>
          <label>
            Комнаты
            <input value={form.rooms} onChange={(event) => updateField('rooms', event.target.value)} />
          </label>
          <label>
            Этаж
            <input value={form.floor} onChange={(event) => updateField('floor', event.target.value)} />
          </label>
          <label>
            Всего этажей
            <input value={form.totalFloors} onChange={(event) => updateField('totalFloors', event.target.value)} />
          </label>
          <label>
            Tenants count
            <input value={form.tenantsCount} onChange={(event) => updateField('tenantsCount', event.target.value)} />
          </label>
          <label>
            Тип здания
            <select value={form.buildingType} onChange={(event) => updateField('buildingType', event.target.value as BuildingType)}>
              {buildingTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Ремонт
            <select value={form.renovation} onChange={(event) => updateField('renovation', event.target.value as RenovationType)}>
              {renovationTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Отопление
            <input value={form.heating} onChange={(event) => updateField('heating', event.target.value)} />
          </label>
        </FormSection>

        <FormSection title="Удобства">
          <ToggleField label="Кондиционер" checked={form.airConditioner} onChange={(value) => updateField('airConditioner', value)} />
          <ToggleField label="Балкон" checked={form.balcony} onChange={(value) => updateField('balcony', value)} />
          <ToggleField label="Лифт" checked={form.elevator} onChange={(value) => updateField('elevator', value)} />
          <ToggleField label="Парковка" checked={form.parking} onChange={(value) => updateField('parking', value)} />
          <ToggleField label="Посудомойка" checked={form.dishwasher} onChange={(value) => updateField('dishwasher', value)} />
          <ToggleField label="Духовка" checked={form.oven} onChange={(value) => updateField('oven', value)} />
          <ToggleField label="Плита" checked={form.stove} onChange={(value) => updateField('stove', value)} />
          <ToggleField label="TV" checked={form.tv} onChange={(value) => updateField('tv', value)} />
          <ToggleField label="Пылесос" checked={form.vacuumCleaner} onChange={(value) => updateField('vacuumCleaner', value)} />
          <ToggleField label="Душ" checked={form.shower} onChange={(value) => updateField('shower', value)} />
          <ToggleField label="Холодильник" checked={form.fridge} onChange={(value) => updateField('fridge', value)} />
          <ToggleField label="Стиральная машина" checked={form.washingMachine} onChange={(value) => updateField('washingMachine', value)} />
          <ToggleField label="Интернет" checked={form.internet} onChange={(value) => updateField('internet', value)} />
          <label>
            Можно с животными
            <select value={form.petPolicy} onChange={(event) => updateField('petPolicy', event.target.value as PetPolicy)}>
              {petPolicies.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </FormSection>

        <FormSection title="Финансы и контакты">
          <label>
            Срок аренды
            <input value={form.rentalTerm} onChange={(event) => updateField('rentalTerm', event.target.value)} />
          </label>
          <label>
            Депозит
            <input value={form.deposit} onChange={(event) => updateField('deposit', event.target.value)} />
          </label>
          <label>
            Комиссия клиента
            <input disabled value={form.clientCommission} />
          </label>
          <label>
            Комиссия собственника
            <input value={form.ownerCommission} onChange={(event) => updateField('ownerCommission', event.target.value)} />
          </label>
          <ToggleField label="Налог включен" checked={form.taxIncluded} onChange={(value) => updateField('taxIncluded', value)} />
          <label>
            Агент
            <input value={form.agent} onChange={(event) => updateField('agent', event.target.value)} />
          </label>
          <label>
            Оператор
            <input value={form.operator} onChange={(event) => updateField('operator', event.target.value)} />
          </label>
          <label>
            Контакт для публикации
            <input value={form.publicationContact} onChange={(event) => updateField('publicationContact', event.target.value)} />
          </label>
          <label>
            Собственник
            <input value={form.owner} onChange={(event) => updateField('owner', event.target.value)} />
          </label>
          <label>
            Телефон собственника
            <input value={form.ownerPhone} onChange={(event) => updateField('ownerPhone', event.target.value)} />
          </label>
          <label>
            Telegram собственника
            <input value={form.ownerTelegram} onChange={(event) => updateField('ownerTelegram', event.target.value)} />
          </label>
          <label>
            Видео-ссылка
            <input value={form.videoUrl} onChange={(event) => updateField('videoUrl', event.target.value)} />
          </label>
          <ToggleField label="Эксклюзив" checked={form.exclusive} onChange={(value) => updateField('exclusive', value)} />
        </FormSection>

        <section className="formSection">
          <div className="sectionHeader">
            <div>
              <h2>Фото объекта</h2>
              <p>Загрузите фото с компьютера, добавьте ссылки и выберите главный кадр для карточек и Telegram.</p>
            </div>
          </div>
          <div className="photoTools">
            <label className="uploadBox">
              <Upload size={20} />
              Загрузить фотографии
              <input multiple accept="image/*" type="file" onChange={handleFiles} />
            </label>
            <div className="urlPhotoBox">
              <input placeholder="https://..." value={photoUrl} onChange={(event) => setPhotoUrl(event.target.value)} />
              <button className="secondaryButton" onClick={addUrlPhoto} type="button">
                <ImagePlus size={18} />
                Добавить ссылку
              </button>
            </div>
          </div>
          <EditablePhotoGrid
            mainPhotoId={form.mainPhotoId}
            onMain={(photoId) => updateField('mainPhotoId', photoId)}
            onRemove={removePhoto}
            photos={form.photos}
          />
        </section>

        <FormSection title="Внутренние заметки">
          <label className="wideField">
            Заметки внутренние
            <textarea rows={4} value={form.internalNotes} onChange={(event) => updateField('internalNotes', event.target.value)} />
          </label>
        </FormSection>

        <div className="formActions">
          <button className="primaryButton" type="submit">
            <Check size={18} />
            Сохранить объект
          </button>
        </div>
      </form>
    </PageFrame>
  );
}

function FormSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="formSection">
      <h2>{title}</h2>
      <div className="formGrid">{children}</div>
    </section>
  );
}

function ToggleField({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="toggleField">
      <input checked={checked} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function EditablePhotoGrid({
  mainPhotoId,
  onMain,
  onRemove,
  photos,
}: {
  mainPhotoId: string;
  onMain: (photoId: string) => void;
  onRemove: (photoId: string) => void;
  photos: PropertyPhoto[];
}) {
  if (photos.length === 0) {
    return <EmptyState title="Фото пока нет" text="Добавьте минимум 3 фотографии для качественного объявления." />;
  }
  return (
    <div className="editablePhotos">
      {photos.map((photo) => (
        <article className={photo.id === mainPhotoId ? 'editablePhoto mainSelected' : 'editablePhoto'} key={photo.id}>
          <img alt={photo.name} src={photo.src} />
          <div>
            <button className="secondaryButton" onClick={() => onMain(photo.id)} type="button">
              {photo.id === mainPhotoId ? 'Главное фото' : 'Сделать главным'}
            </button>
            <button className="iconButton danger" onClick={() => onRemove(photo.id)} type="button">
              <Trash2 size={16} />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function fileToPhoto(file: File) {
  return new Promise<PropertyPhoto>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: crypto.randomUUID(),
        name: file.name,
        src: String(reader.result || ''),
        type: 'upload',
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function extractHashtags(text: string) {
  return Array.from(new Set(text.match(/#[A-Za-z0-9]+/g) || [])).join(' ');
}

function publicationStatusClassName(status: PublicationStatus) {
  return `status status-${status.toLowerCase().replace(/\s+/g, '-')}`;
}

function PostPreviewPage() {
  const { addPublication, brandSettings, properties, publications, session, showToast } = useCrm();
  const searchParams = new URLSearchParams(useLocation().search);
  const initialPropertyId = searchParams.get('property') || properties[0]?.id || '';
  const [selectedPropertyId, setSelectedPropertyId] = useState(initialPropertyId);
  const selectedProperty = properties.find((property) => property.id === selectedPropertyId) || properties[0];
  const [language, setLanguage] = useState<PostLanguage>(brandSettings.defaultLanguage);
  const [templateType, setTemplateType] = useState<DealType>(selectedProperty?.dealType || 'Rent');
  const [publishingMode, setPublishingMode] = useState<BrandSettings['publishingMode']>(brandSettings.publishingMode);
  const [copied, setCopied] = useState(false);
  const [confirmProductionOpen, setConfirmProductionOpen] = useState(false);

  useEffect(() => {
    if (selectedProperty) setTemplateType(selectedProperty.dealType);
  }, [selectedProperty]);

  const postText = selectedProperty ? buildTelegramPost(selectedProperty, brandSettings, language, templateType) : '';
  const hashtags = extractHashtags(postText);

  function recordPublication(status: PublicationStatus, channel: Publication['channel'], error?: string, messageLink?: string) {
    if (!selectedProperty) return;
    addPublication({
      id: crypto.randomUUID(),
      propertyId: selectedProperty.id,
      propertyTitle: selectedProperty.titleEn || selectedProperty.titleRu || selectedProperty.address,
      date: new Date().toISOString(),
      author: session?.name || selectedProperty.agent || 'Molecula user',
      channel,
      status,
      text: postText,
      photosCount: selectedProperty.photos.length,
      error,
      messageLink,
    });
  }

  async function copyPost() {
    await copyText(postText);
    setCopied(true);
    showToast('Пост скопирован');
    recordPublication('Copied', publishingMode);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function copyHashtags() {
    await copyText(hashtags);
    setCopied(true);
    showToast('Хэштеги скопированы');
    window.setTimeout(() => setCopied(false), 2000);
  }

  function saveDraft() {
    recordPublication('Draft', publishingMode);
    showToast('Пост сохранен в истории');
  }

  async function publishViaBackend(channel: 'Test' | 'Production') {
    if (!selectedProperty) return;
    const endpoint = channel === 'Test' ? '/api/telegram/publish-test' : '/api/telegram/publish-production';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectId: selectedProperty.id,
          text: postText,
          photos: selectedProperty.photos.map((photo) => photo.src),
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = (await response.json()) as { messageLink?: string };
      recordPublication(channel === 'Test' ? 'Test Published' : 'Production Published', channel, undefined, result.messageLink);
      showToast(channel === 'Test' ? 'Тестовая публикация отправлена' : 'Production публикация отправлена');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Backend endpoint not connected';
      recordPublication('Error', channel, message);
      showToast('Telegram endpoint недоступен. Запись добавлена в историю.', 'warning');
    }
  }

  function publishTelegram() {
    if (publishingMode === 'Production') {
      setConfirmProductionOpen(true);
      return;
    }
    if (publishingMode === 'Test') {
      void publishViaBackend('Test');
      return;
    }
    recordPublication('Copied', 'Demo');
    showToast('Demo Mode: пост готов к ручной публикации');
  }

  return (
    <PageFrame
      actions={
        <button className="primaryButton" onClick={copyPost} type="button">
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? 'Скопировано' : 'Скопировать пост'}
        </button>
      }
    >
      <section className="previewLayout">
        <div className="workspace">
          <div className="sectionHeader">
            <div>
              <h2>Генератор Telegram-поста</h2>
              <p>Выберите объект, язык и шаблон. Фото и текст подготовлены для Demo Mode.</p>
            </div>
          </div>
          <div className="filtersPanel previewFilters">
            <label>
              Объект
              <select value={selectedPropertyId} onChange={(event) => setSelectedPropertyId(event.target.value)}>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.id} · {property.address}
                  </option>
                ))}
              </select>
            </label>
              <label>
                Язык
                <select value={language} onChange={(event) => setLanguage(event.target.value as PostLanguage)}>
                  <option>EN</option>
                  <option>RU</option>
              </select>
            </label>
            <label>
              Тип шаблона
              <select value={templateType} onChange={(event) => setTemplateType(event.target.value as DealType)}>
                {dealTypes.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Режим публикации
              <select value={publishingMode} onChange={(event) => setPublishingMode(event.target.value as BrandSettings['publishingMode'])}>
                <option>Demo</option>
                <option>Test</option>
                <option>Production</option>
              </select>
            </label>
          </div>

          {selectedProperty && (
            <>
              <ObjectGallery property={selectedProperty} />
              <div className="publicationActions">
                <button className="secondaryButton" onClick={saveDraft} type="button">
                  <FileText size={18} />
                  Сохранить в историю
                </button>
                <a className="secondaryButton" href="https://web.telegram.org/" target="_blank" rel="noreferrer">
                  <ExternalLink size={18} />
                  Открыть Telegram
                </a>
                <button className="secondaryButton" onClick={copyPost} type="button">
                  <Copy size={18} />
                  Скопировать фото и текст вручную
                </button>
                <button className="secondaryButton" onClick={copyHashtags} type="button">
                  <Sparkles size={18} />
                  Скопировать хэштеги
                </button>
                <button className="secondaryButton dangerText" onClick={publishTelegram} type="button">
                  <MessageCircle size={18} />
                  {publishingMode === 'Production' ? 'Production publish' : publishingMode === 'Test' ? 'Test publish' : 'Demo publish'}
                </button>
              </div>
            </>
          )}

          <PublicationHistory publications={publications.slice(0, 6)} />
        </div>

        <PhonePreview copied={copied} postText={postText} property={selectedProperty} />
      </section>
      <ConfirmDialog
        confirmLabel="Опубликовать"
        isOpen={confirmProductionOpen}
        title="Production публикация?"
        text="Пост будет отправлен в production-канал Rent in Tbilisi, если backend endpoint подключен."
        onCancel={() => setConfirmProductionOpen(false)}
        onConfirm={() => {
          setConfirmProductionOpen(false);
          void publishViaBackend('Production');
        }}
      />
    </PageFrame>
  );
}

function PhonePreview({ copied, postText, property }: { copied: boolean; postText: string; property?: Property }) {
  const mainPhoto = property ? getMainPhoto(property) : undefined;
  return (
    <aside className="phoneShell">
      <div className="phoneHeader">
        <span />
        <strong>Rent in Tbilisi</strong>
        <span />
      </div>
      <div className="phoneScreen">
        {mainPhoto ? <img alt={mainPhoto.name} className="phoneImage" src={mainPhoto.src} /> : <div className="phoneImage emptyPhoneImage" />}
        <pre>{postText}</pre>
      </div>
      {copied && <div className="copiedPill">Скопировано</div>}
    </aside>
  );
}

function TelegramPage() {
  const { brandSettings, publications } = useCrm();
  const activeChannel =
    brandSettings.publishingMode === 'Production' ? brandSettings.productionChannelId : brandSettings.testChannelId;
  return (
    <PageFrame
      actions={
        <Link className="primaryButton" to="/post-preview">
          <Smartphone size={18} />
          Создать пост
        </Link>
      }
    >
      <section className="workspace">
        <div className="sectionHeader">
          <div>
            <h2>Telegram Center</h2>
            <p>Demo безопасен для ручной публикации. Test и Production пишут результат endpoint в историю.</p>
          </div>
          <span className="status status-on-advertising">{brandSettings.publishingMode}: {activeChannel}</span>
        </div>
        <div className="telegramModes">
          <InfoItem label="Demo" value="Копирование текста, фото и ручное открытие Telegram" />
          <InfoItem label="Test endpoint" value="POST /api/telegram/publish-test" />
          <InfoItem label="Production endpoint" value="POST /api/telegram/publish-production с подтверждением" />
          <InfoItem label="Production channel" value={brandSettings.productionChannelId} />
        </div>
      </section>
      <PublicationHistory publications={publications} />
    </PageFrame>
  );
}

function PublicationHistory({ publications }: { publications: Publication[] }) {
  return (
    <section className="workspace publicationHistory">
      <div className="sectionHeader">
        <div>
          <h2>История публикаций</h2>
          <p>Локальная таблица: черновики, скопированные посты и попытки публикации.</p>
        </div>
      </div>
      {publications.length === 0 ? (
        <EmptyState title="История пуста" text="Сохраните или скопируйте пост, чтобы запись появилась здесь." />
      ) : (
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Объект</th>
                <th>Автор</th>
                <th>Канал</th>
                <th>Статус</th>
                <th>Фото</th>
                <th>Текст</th>
                <th>Ошибка / ссылка</th>
              </tr>
            </thead>
            <tbody>
              {publications.map((publication) => (
                <tr key={publication.id}>
                  <td>{new Date(publication.date).toLocaleString('ru-RU')}</td>
                  <td>{publication.propertyTitle}</td>
                  <td>{publication.author}</td>
                  <td>{publication.channel}</td>
                  <td>
                    <span className={publicationStatusClassName(publication.status)}>{publication.status}</span>
                  </td>
                  <td>{publication.photosCount}</td>
                  <td>
                    <span>{publication.text.slice(0, 90)}...</span>
                  </td>
                  <td>
                    {publication.messageLink ? (
                      <a href={publication.messageLink} target="_blank" rel="noreferrer">
                        Telegram link
                      </a>
                    ) : (
                      publication.error || '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function AgentsPage() {
  const { agents } = useCrm();
  return (
    <PageFrame>
      <section className="metrics compactMetrics">
        <article>
          <span>Всего</span>
          <strong>{agents.length}</strong>
        </article>
        <article>
          <span>Активны</span>
          <strong>{agents.filter((agent) => agent.isActive).length}</strong>
        </article>
        <article>
          <span>Сделок</span>
          <strong>{agents.reduce((sum, agent) => sum + agent.dealsCount, 0)}</strong>
        </article>
        <article>
          <span>Эксклюзивов</span>
          <strong>{agents.reduce((sum, agent) => sum + agent.exclusiveCount, 0)}</strong>
        </article>
      </section>
      <section className="workspace">
        <div className="sectionHeader">
          <div>
            <h2>Команда Molecula</h2>
            <p>Роли, активность, сделки, эксклюзивы и комиссия.</p>
          </div>
        </div>
        <div className="agentGrid">
          {agents.map((agent) => (
            <AgentCard agent={agent} key={agent.id} />
          ))}
        </div>
      </section>
    </PageFrame>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link className="agentCard" to={`/agents/${agent.id}`}>
      <div className="agentHeader">
        <span className="avatar large">{initials(agent.name)}</span>
        <div>
          <strong>{agent.name}</strong>
          <span>{agent.role}</span>
        </div>
        <span className={agent.isActive ? 'agentState active' : 'agentState'}>{agent.isActive ? 'Активен' : 'Неактивен'}</span>
      </div>
      <div className="agentStats">
        <InfoItem label="Telegram" value={agent.telegram} />
        <InfoItem label="Телефон" value={agent.phone} />
        <InfoItem label="Сделок" value={String(agent.dealsCount)} />
        <InfoItem label="Эксклюзивов" value={String(agent.exclusiveCount)} />
        <InfoItem label="Комиссия" value={`${agent.commissionPercent}%`} />
      </div>
    </Link>
  );
}

function AgentDetailPage() {
  const { agents } = useCrm();
  const { agentId } = useParams();
  const agent = agents.find((item) => item.id === agentId);
  if (!agent) {
    return (
      <PageFrame>
        <NotFoundPanel title="Агент не найден" backTo="/agents" />
      </PageFrame>
    );
  }
  return (
    <PageFrame>
      <section className="detailLayout">
        <div className="workspace">
          <Link className="backLink" to="/agents">
            <ArrowLeft size={16} />
            Агенты
          </Link>
          <div className="agentProfile">
            <span className="avatar xlarge">{initials(agent.name)}</span>
            <div>
              <span className={agent.isActive ? 'agentState active' : 'agentState'}>
                {agent.isActive ? 'Активен' : 'Неактивен'}
              </span>
              <h2>{agent.name}</h2>
              <p>{agent.role}</p>
            </div>
          </div>
          <div className="detailGrid">
            <InfoItem label="Telegram" value={agent.telegram} />
            <InfoItem label="Телефон" value={agent.phone} />
            <InfoItem label="Роль" value={agent.role} />
            <InfoItem label="Количество сделок" value={String(agent.dealsCount)} />
            <InfoItem label="Количество эксклюзивов" value={String(agent.exclusiveCount)} />
            <InfoItem label="Процент комиссии" value={`${agent.commissionPercent}%`} />
          </div>
        </div>
        <aside className="workspace compact">
          <h2>Роли команды</h2>
          <div className="roleList">
            {teamRoles.map((role) => (
              <span key={role}>{role}</span>
            ))}
          </div>
        </aside>
      </section>
    </PageFrame>
  );
}

function OwnersPage() {
  const { owners } = useCrm();
  return (
    <EntityTable
      columns={['Имя', 'Телефон', 'Telegram', 'Объекты', 'Язык', 'Доверительное управление']}
      rows={owners.map((owner) => [
        owner.name,
        owner.phone,
        owner.telegram,
        owner.objects.join(', '),
        owner.language,
        owner.trustManagement ? 'Да' : 'Нет',
      ])}
      title="Собственники"
    />
  );
}

function ClientsPage() {
  const { clients } = useCrm();
  return (
    <EntityTable
      columns={['Имя', 'Телефон', 'Telegram', 'Бюджет', 'Запрос', 'Район', 'Статус', 'Агент']}
      rows={clients.map((client) => [
        client.name,
        client.phone,
        client.telegram,
        client.budget,
        client.request,
        client.district,
        client.status,
        client.agent,
      ])}
      title="Клиенты"
    />
  );
}

function DealsPage() {
  const { deals } = useCrm();
  return (
    <EntityTable
      columns={['Объект', 'Клиент', 'Собственник', 'Агент', 'Тип', 'Сумма', 'Комиссия', 'Дата', 'Статус']}
      rows={deals.map((deal) => [
        deal.propertyId,
        deal.client,
        deal.owner,
        deal.agent,
        deal.dealType,
        deal.amount,
        deal.commission,
        deal.date,
        deal.status,
      ])}
      title="Сделки"
    />
  );
}

function AnalyticsPage() {
  const { agents, deals, properties, publications } = useCrm();
  const stats = getPropertyStats(properties);
  const agentRows = agentAnalytics(agents, properties, deals, publications);
  const monthCommission = deals
    .filter((deal) => Date.parse(deal.date) >= Date.now() - 30 * 24 * 60 * 60 * 1000)
    .reduce((sum, deal) => sum + safeNumber(deal.commission), 0);
  const metrics = [
    { label: 'Объекты всего', value: stats.total },
    { label: 'Добавлено за неделю', value: stats.addedWeek },
    { label: 'Добавлено за месяц', value: stats.addedMonth },
    { label: 'Сдано за неделю', value: stats.rentedWeek },
    { label: 'Сдано за месяц', value: stats.rentedMonth },
    { label: 'Продано за месяц', value: stats.soldMonth },
    { label: 'Реализовано за месяц', value: stats.realizedMonth },
    { label: 'Конверсия', value: `${stats.conversionRate}%` },
    { label: 'Публикации за неделю', value: thisWeekCount(publications) },
    { label: 'Публикации за месяц', value: thisMonthCount(publications) },
    { label: 'Комиссия за месяц', value: `${monthCommission}$` },
    { label: 'Активные агенты', value: agents.filter((agent) => agent.isActive).length },
  ];

  return (
    <PageFrame>
      <section className="metrics dashboardMetrics">
        {metrics.map((metric) => (
          <article key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>
      <section className="workspace">
        <div className="sectionHeader">
          <div>
            <h2>Статистика по агентам</h2>
            <p>Объекты, сделки, эксклюзивы, публикации и конверсия по каждому члену команды.</p>
          </div>
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Агент</th>
                <th>Роль</th>
                <th>Объекты</th>
                <th>Эксклюзивы</th>
                <th>Сдано</th>
                <th>Продано</th>
                <th>Сделки</th>
                <th>Комиссия</th>
                <th>Конверсия</th>
                <th>Активность 7/30</th>
                <th>Публикации</th>
              </tr>
            </thead>
            <tbody>
              {agentRows.map((agent) => (
                <tr key={agent.id}>
                  <td>{agent.name}</td>
                  <td>{agent.role}</td>
                  <td>{agent.objects}</td>
                  <td>{agent.exclusives}</td>
                  <td>{agent.rented}</td>
                  <td>{agent.sold}</td>
                  <td>{agent.deals}</td>
                  <td>{agent.commissionSum}$</td>
                  <td>{agent.conversion}%</td>
                  <td>{agent.weekActivity}/{agent.monthActivity}</td>
                  <td>{agent.publications}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageFrame>
  );
}

function DistrictsPage() {
  const { properties } = useCrm();
  const rows = districtAnalytics(properties);

  return (
    <PageFrame>
      <section className="workspace">
        <div className="sectionHeader">
          <div>
            <h2>Районы и цены</h2>
            <p>Средние и медианные цены по районам, включая расчет за м².</p>
          </div>
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Район</th>
                <th>Аренда</th>
                <th>Средняя аренда</th>
                <th>Медиана аренды</th>
                <th>Мин / макс</th>
                <th>Аренда / м²</th>
                <th>1Bed / 2Bed / 3Bed</th>
                <th>Продажа</th>
                <th>Средняя продажа</th>
                <th>Продажа / м²</th>
                <th>Реализовано 30 дней</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.district}>
                  <td>{row.district}</td>
                  <td>{row.rentCount}</td>
                  <td>{row.avgRent ? `${row.avgRent}$` : '-'}</td>
                  <td>{row.medianRent ? `${row.medianRent}$` : '-'}</td>
                  <td>{row.minRent ? `${row.minRent}$ / ${row.maxRent}$` : '-'}</td>
                  <td>{row.avgRentM2 ? `${row.avgRentM2}$/м²` : '-'}</td>
                  <td>{[row.avg1Bed, row.avg2Bed, row.avg3Bed].map((value) => (value ? `${value}$` : '-')).join(' / ')}</td>
                  <td>{row.saleCount}</td>
                  <td>{row.avgSale ? `${row.avgSale}$` : '-'}</td>
                  <td>{row.avgSaleM2 ? `${row.avgSaleM2}$/м²` : '-'}</td>
                  <td>{row.realizedMonth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageFrame>
  );
}

function PublicationsPage() {
  const { publications } = useCrm();
  const [channel, setChannel] = useState<Publication['channel'] | 'Все каналы'>('Все каналы');
  const [status, setStatus] = useState<PublicationStatus | 'Все статусы'>('Все статусы');
  const filtered = publications.filter((publication) => {
    const matchesChannel = channel === 'Все каналы' || publication.channel === channel;
    const matchesStatus = status === 'Все статусы' || publication.status === status;
    return matchesChannel && matchesStatus;
  });

  return (
    <PageFrame>
      <section className="metrics compactMetrics">
        <article>
          <span>Всего</span>
          <strong>{publications.length}</strong>
        </article>
        <article>
          <span>За неделю</span>
          <strong>{thisWeekCount(publications)}</strong>
        </article>
        <article>
          <span>За месяц</span>
          <strong>{thisMonthCount(publications)}</strong>
        </article>
        <article>
          <span>Production</span>
          <strong>{publications.filter((publication) => publication.channel === 'Production').length}</strong>
        </article>
        <article>
          <span>Ошибки</span>
          <strong>{publications.filter((publication) => publication.status === 'Error').length}</strong>
        </article>
        <article>
          <span>Скопировано</span>
          <strong>{publications.filter((publication) => publication.status === 'Copied').length}</strong>
        </article>
      </section>
      <section className="workspace">
        <div className="filtersPanel slimFilters">
          <label>
            Канал
            <select value={channel} onChange={(event) => setChannel(event.target.value as Publication['channel'] | 'Все каналы')}>
              <option>Все каналы</option>
              <option>Demo</option>
              <option>Test</option>
              <option>Production</option>
            </select>
          </label>
          <label>
            Статус
            <select value={status} onChange={(event) => setStatus(event.target.value as PublicationStatus | 'Все статусы')}>
              <option>Все статусы</option>
              <option>Draft</option>
              <option>Copied</option>
              <option>Test Published</option>
              <option>Production Published</option>
              <option>Error</option>
            </select>
          </label>
        </div>
      </section>
      <PublicationHistory publications={filtered} />
    </PageFrame>
  );
}

function EntityTable({ columns, rows, title }: { columns: string[]; rows: string[][]; title: string }) {
  return (
    <PageFrame>
      <section className="workspace">
        <div className="sectionHeader">
          <div>
            <h2>{title}</h2>
            <p>Базовая рабочая таблица для следующего этапа CRM.</p>
          </div>
        </div>
        {rows.length === 0 ? (
          <EmptyState title={`${title}: нет записей`} text="Записи появятся здесь после добавления данных." />
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${index}-${cellIndex}`}>{cell || '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageFrame>
  );
}

function SettingsPage() {
  const { brandSettings, setBrandSettings, showToast } = useCrm();
  const [form, setForm] = useState(brandSettings);

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBrandSettings(form);
    showToast('Настройки бренда сохранены');
  }

  return (
    <PageFrame>
      <form className="workspace settingsForm" onSubmit={saveSettings}>
        <div className="sectionHeader">
          <div>
            <h2>Настройки бренда и Telegram</h2>
            <p>Фронтенд хранит только бренд, каналы и шаблон. Bot Token должен оставаться на backend.</p>
          </div>
        </div>
        <div className="formGrid">
          <label>
            Название бренда
            <input value={form.brandName} onChange={(event) => setForm((current) => ({ ...current, brandName: event.target.value }))} />
          </label>
          <label>
            Telegram username
            <input
              value={form.telegramUsername}
              onChange={(event) => setForm((current) => ({ ...current, telegramUsername: event.target.value }))}
            />
          </label>
          <label>
            Test channel
            <input value={form.testChannelId} onChange={(event) => setForm((current) => ({ ...current, testChannelId: event.target.value }))} />
          </label>
          <label>
            Production channel
            <input
              value={form.productionChannelId}
              onChange={(event) => setForm((current) => ({ ...current, productionChannelId: event.target.value }))}
            />
          </label>
          <label>
            Режим публикации
            <select
              value={form.publishingMode}
              onChange={(event) => setForm((current) => ({ ...current, publishingMode: event.target.value as BrandSettings['publishingMode'] }))}
            >
              <option>Demo</option>
              <option>Test</option>
              <option>Production</option>
            </select>
          </label>
          <label>
            Язык поста
            <select
              value={form.defaultLanguage}
              onChange={(event) => setForm((current) => ({ ...current, defaultLanguage: event.target.value as PostLanguage }))}
            >
              <option>EN</option>
              <option>RU</option>
            </select>
          </label>
          <label>
            Валюта по умолчанию
            <select
              value={form.defaultCurrency}
              onChange={(event) => setForm((current) => ({ ...current, defaultCurrency: event.target.value as Currency }))}
            >
              {currencies.map((currency) => (
                <option key={currency}>{currency}</option>
              ))}
            </select>
          </label>
          <label>
            Телефон
            <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
          </label>
          <label>
            Основной контакт
            <input value={form.mainContact} onChange={(event) => setForm((current) => ({ ...current, mainContact: event.target.value }))} />
          </label>
          <label>
            Подпись в посте
            <input
              value={form.defaultSignature}
              onChange={(event) => setForm((current) => ({ ...current, defaultSignature: event.target.value }))}
            />
          </label>
          <label>
            Подпись оператора
            <input
              value={form.operatorSignature}
              onChange={(event) => setForm((current) => ({ ...current, operatorSignature: event.target.value }))}
            />
          </label>
          <ToggleField
            label="Показывать 0% Commission"
            checked={form.includeZeroCommission}
            onChange={(value) => setForm((current) => ({ ...current, includeZeroCommission: value }))}
          />
          <ToggleField
            label="Показывать APARTMENTS ON MAP"
            checked={form.includeMapBlock}
            onChange={(value) => setForm((current) => ({ ...current, includeMapBlock: value }))}
          />
          <ToggleField
            label="Блок отзывов"
            checked={form.includeReviewsBlock}
            onChange={(value) => setForm((current) => ({ ...current, includeReviewsBlock: value }))}
          />
        </div>
        <div className="settingsNotice">
          <ShieldCheck size={18} />
          <span>Production ожидает POST /api/telegram/publish-production, Test ожидает POST /api/telegram/publish-test.</span>
        </div>
        <div className="formActions">
          <button className="primaryButton" type="submit">
            Сохранить настройки
          </button>
        </div>
      </form>
    </PageFrame>
  );
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="infoItem">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState({ text, title }: { text: string; title: string }) {
  return (
    <div className="emptySection">
      <span className="emptyIcon">
        <Sparkles size={24} />
      </span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function NotFoundPanel({ backTo, title }: { backTo: string; title: string }) {
  return (
    <section className="workspace emptySection">
      <span className="emptyIcon">
        <Building2 size={24} />
      </span>
      <h2>{title}</h2>
      <Link className="secondaryButton" to={backTo}>
        Вернуться
      </Link>
    </section>
  );
}

function ConfirmDialog({
  confirmLabel = 'Удалить',
  isOpen,
  onCancel,
  onConfirm,
  text,
  title,
}: {
  confirmLabel?: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  text: string;
  title: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="modalBackdrop" role="dialog" aria-modal="true">
      <div className="confirmDialog">
        <button className="iconButton closeButton" onClick={onCancel} type="button">
          <X size={18} />
        </button>
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="formActions">
          <button className="secondaryButton" onClick={onCancel} type="button">
            Отмена
          </button>
          <button className="primaryButton dangerButton" onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Some embedded browsers expose the Clipboard API but reject writeText without focus.
    }
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}
