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

type DealType = 'Аренда' | 'Продажа';
type Category = 'Квартира' | 'Дом' | 'Коммерция' | 'Земля' | 'Отель' | 'Офис';
type PropertyStatus = 'Новый' | 'В работе' | 'На рекламе' | 'Сдан' | 'Продан' | 'Архив';
type PetPolicy = 'Да' | 'Нет' | 'Обсуждается';
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
type PublicationStatus = 'черновик' | 'скопировано' | 'опубликовано' | 'ошибка';
type PostLanguage = 'EN' | 'RU';

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
  district: string;
  metro: string;
  address: string;
  building: string;
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
  heating: string;
  airConditioner: boolean;
  balcony: boolean;
  elevator: boolean;
  parking: boolean;
  dishwasher: boolean;
  oven: boolean;
  stove: boolean;
  fridge: boolean;
  washingMachine: boolean;
  internet: boolean;
  petPolicy: PetPolicy;
  rentalTerm: string;
  deposit: string;
  clientCommission: '0%';
  ownerCommission: string;
  agent: string;
  operator: string;
  owner: string;
  ownerPhone: string;
  ownerTelegram: string;
  status: PropertyStatus;
  exclusive: boolean;
  internalNotes: string;
  photos: PropertyPhoto[];
  mainPhotoId: string;
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
  channel: string;
  status: PublicationStatus;
  text: string;
};

type BrandSettings = {
  telegramBotToken: string;
  telegramChannelId: string;
  mainContact: string;
  phone: string;
  agentSignature: string;
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

const dealTypes: DealType[] = ['Аренда', 'Продажа'];
const categories: Category[] = ['Квартира', 'Дом', 'Коммерция', 'Земля', 'Отель', 'Офис'];
const propertyStatuses: PropertyStatus[] = ['Новый', 'В работе', 'На рекламе', 'Сдан', 'Продан', 'Архив'];
const petPolicies: PetPolicy[] = ['Да', 'Нет', 'Обсуждается'];
const currencies: Currency[] = ['$', '₾', '€'];
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
  telegramBotToken: '',
  telegramChannelId: '@rentintbilisi',
  mainContact: '@David_Tibelashvili',
  phone: '+995 599 20 67 16',
  agentSignature: '#Mari',
  operatorSignature: 'Molecula Operator',
};

const emptyProperty: PropertyFormState = {
  dealType: 'Аренда',
  category: 'Квартира',
  district: '',
  metro: '',
  address: '',
  building: '',
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
  heating: 'Central Heating',
  airConditioner: false,
  balcony: false,
  elevator: false,
  parking: false,
  dishwasher: false,
  oven: false,
  stove: true,
  fridge: true,
  washingMachine: true,
  internet: true,
  petPolicy: 'Обсуждается',
  rentalTerm: '12 месяцев',
  deposit: '1 месяц',
  clientCommission: '0%',
  ownerCommission: '50%',
  agent: 'David Tibelashvili',
  operator: 'Mari',
  owner: '',
  ownerPhone: '',
  ownerTelegram: '',
  status: 'Новый',
  exclusive: false,
  internalNotes: '',
  photos: [],
  mainPhotoId: '',
};

const starterProperties: Property[] = [
  {
    ...emptyProperty,
    id: 'RIT-1001',
    dealType: 'Аренда',
    category: 'Квартира',
    district: 'Vake',
    metro: 'Rustaveli',
    address: 'Ilia Chavchavadze Ave 37',
    building: 'Axis Towers area',
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
    balcony: true,
    elevator: true,
    dishwasher: true,
    oven: true,
    stove: true,
    fridge: true,
    washingMachine: true,
    internet: true,
    owner: 'Giorgi Maisuradze',
    ownerPhone: '+995 599 10 20 30',
    ownerTelegram: '@giorgi_owner',
    status: 'На рекламе',
    exclusive: true,
    internalNotes: 'Показы после 18:00. Ключи у консьержа.',
    photos: fallbackPhotos,
    mainPhotoId: fallbackPhotos[0].id,
    createdAt: '2026-07-01T10:00:00.000Z',
    updatedAt: '2026-07-01T10:00:00.000Z',
  },
  {
    ...emptyProperty,
    id: 'RIT-1002',
    dealType: 'Продажа',
    category: 'Квартира',
    district: 'Sololaki',
    metro: 'Liberty Square',
    address: 'Atoneli St 12',
    building: 'Old Tbilisi residence',
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
    balcony: true,
    oven: true,
    stove: true,
    fridge: true,
    internet: true,
    owner: 'Mariam Janelidze',
    ownerPhone: '+995 577 44 55 66',
    ownerTelegram: '@mariam_owner',
    status: 'Продан',
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
    createdAt: '2026-06-28T12:20:00.000Z',
    updatedAt: '2026-06-28T12:20:00.000Z',
  },
  {
    ...emptyProperty,
    id: 'RIT-1003',
    dealType: 'Аренда',
    category: 'Квартира',
    district: 'Saburtalo',
    metro: 'Medical University',
    address: 'Bakhtrioni St 22',
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
    balcony: true,
    elevator: true,
    oven: true,
    stove: true,
    fridge: true,
    washingMachine: true,
    internet: true,
    petPolicy: 'Обсуждается',
    owner: 'Irakli Nadiradze',
    ownerPhone: '+995 555 77 88 90',
    ownerTelegram: '@irakli_owner',
    status: 'В работе',
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
    createdAt: '2026-06-20T09:10:00.000Z',
    updatedAt: '2026-06-20T09:10:00.000Z',
  },
];

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
];

const starterDeals: Deal[] = [
  {
    id: 'deal-1',
    propertyId: 'RIT-1002',
    client: 'Private buyer',
    owner: 'Mariam Janelidze',
    agent: 'David Tibelashvili',
    dealType: 'Продажа',
    amount: '185000$',
    commission: '3%',
    date: '2026-06-28',
    status: 'Закрыта',
    notes: 'Успешная продажа.',
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
  return value === true || value === 'true' || value === 'Да';
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
    dealType: dealTypes.includes(property.dealType as DealType) ? (property.dealType as DealType) : 'Аренда',
    category: categories.includes(property.category as Category) ? (property.category as Category) : 'Квартира',
    district: String(property.district || ''),
    metro: String(property.metro || ''),
    address: String(property.address || ''),
    building: String(property.building || ''),
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
    heating: String(property.heating || 'Central Heating'),
    airConditioner: normalizeBoolean(property.airConditioner),
    balcony: normalizeBoolean(property.balcony),
    elevator: normalizeBoolean(property.elevator),
    parking: normalizeBoolean(property.parking),
    dishwasher: normalizeBoolean(property.dishwasher),
    oven: normalizeBoolean(property.oven),
    stove: property.stove === undefined ? true : normalizeBoolean(property.stove),
    fridge: property.fridge === undefined ? true : normalizeBoolean(property.fridge),
    washingMachine: property.washingMachine === undefined ? true : normalizeBoolean(property.washingMachine),
    internet: property.internet === undefined ? true : normalizeBoolean(property.internet),
    petPolicy: petPolicies.includes(property.petPolicy as PetPolicy) ? (property.petPolicy as PetPolicy) : 'Обсуждается',
    rentalTerm: String(property.rentalTerm || '12 месяцев'),
    deposit: String(property.deposit || '1 месяц'),
    clientCommission: '0%',
    ownerCommission: String(property.ownerCommission || '50%'),
    agent: String(property.agent || 'David Tibelashvili'),
    operator: String(property.operator || 'Mari'),
    owner: String(property.owner || ''),
    ownerPhone: String(property.ownerPhone || ''),
    ownerTelegram: String(property.ownerTelegram || ''),
    status: propertyStatuses.includes(property.status as PropertyStatus) ? (property.status as PropertyStatus) : 'Новый',
    exclusive: normalizeBoolean(property.exclusive),
    internalNotes: String(property.internalNotes || property.notes || ''),
    photos,
    mainPhotoId: String(property.mainPhotoId || photos[0]?.id || ''),
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
  const saved = readStorage<Partial<Property>[]>(PROPERTY_STORAGE_KEY, starterProperties);
  return Array.isArray(saved) && saved.length > 0 ? saved.map(normalizeProperty) : starterProperties;
}

function loadAgents() {
  const saved = readStorage<Partial<Agent>[]>(AGENT_STORAGE_KEY, starterAgents);
  return Array.isArray(saved) && saved.length > 0 ? saved.map(normalizeAgent) : starterAgents;
}

function safeNumber(value: string) {
  return Number(value.replace(/[^\d.]/g, '')) || 0;
}

function priceRangeTag(price: string) {
  const numeric = safeNumber(price);
  if (!numeric) return '#PriceOnRequest';
  const bottom = Math.floor(numeric / 500) * 500;
  const top = bottom + 500;
  return `#Price${bottom}to${top}`;
}

function hashtag(value: string) {
  const cleaned = value
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim()
    .replace(/\s+/g, '');
  return cleaned ? `#${cleaned}` : '';
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
  return {
    total: properties.length,
    inWork: properties.filter((property) => property.status === 'В работе').length,
    onAds: properties.filter((property) => property.status === 'На рекламе').length,
    rented: properties.filter((property) => property.status === 'Сдан').length,
    sold: properties.filter((property) => property.status === 'Продан').length,
    archived: properties.filter((property) => property.status === 'Архив').length,
    exclusive: properties.filter((property) => property.exclusive).length,
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

function buildTelegramPost(property: Property, settings: BrandSettings, language: PostLanguage, forcedDealType?: DealType) {
  const dealType = forcedDealType || property.dealType;
  const districtTag = hashtag(property.district);
  const metroTag = property.metro ? hashtag(property.metro) : '';
  const categoryTag = hashtag(property.category);
  const dealTag = dealType === 'Аренда' ? '#Rent' : '#Sale';
  const bedTag = property.bedrooms ? `#${property.bedrooms}Bed` : '#Apartment';
  const featureLine = ['#NewBuilding', '#ModernRenovation'].join(' | ');
  const floor = property.floor && property.totalFloors ? `${property.floor}/${property.totalFloors}Floor` : '';
  const heating = property.heating ? hashtag(property.heating) : '';
  const features = [
    property.stove && '#Stove',
    property.oven && '#Oven',
    property.internet && '#WiFi',
    property.balcony && '#Balcony',
    property.elevator && '#Elevator',
    property.dishwasher && '#Dishwasher',
    property.parking && '#Parking',
    property.airConditioner && '#AC',
  ].filter(Boolean);
  const title =
    language === 'EN'
      ? `Beautiful ${property.category.toLowerCase()} for ${dealType === 'Аренда' ? 'rent' : 'sale'} in ${property.district}`
      : `${property.category} ${dealType === 'Аренда' ? 'в аренду' : 'на продажу'} в районе ${property.district}`;
  const money = property.price ? `${property.price}${property.currency}` : 'Price on request';

  return [
    `${districtTag}  ${property.metro ? `🚇 ${metroTag}` : ''}`.trim(),
    `📍${property.address}`,
    '',
    `🌟${title}🌟`,
    '',
    `🏢 ${bedTag} ${categoryTag} for ${dealTag}`,
    `✨${featureLine}`,
    `🏠${property.area || '-'} Sq.m | ${floor || '-'} | ${heating || '#Heating'} | #Shower`,
    '',
    ...features.reduce<string[]>((rows, feature, index) => {
      if (index % 2 === 0) rows.push(`✅${feature}`);
      else rows[rows.length - 1] = `${rows[rows.length - 1]} ✅${feature}`;
      return rows;
    }, []),
    '',
    `💰${money}`,
    priceRangeTag(property.price),
    '',
    `📲 ${settings.mainContact} |`,
    `${settings.phone} ${settings.agentSignature}`,
    '🌟 Check all listings | Reviews',
    '',
    '📍APARTMENTS ON MAP📍',
  ].join('\n');
}

function AppProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(loadProperties);
  const [agents] = useState<Agent[]>(loadAgents);
  const [owners] = useState<Owner[]>(() => readStorage<Owner[]>(OWNER_STORAGE_KEY, starterOwners));
  const [clients] = useState<Client[]>(() => readStorage<Client[]>(CLIENT_STORAGE_KEY, starterClients));
  const [deals] = useState<Deal[]>(() => readStorage<Deal[]>(DEAL_STORAGE_KEY, starterDeals));
  const [publications, setPublications] = useState<Publication[]>(() =>
    readStorage<Publication[]>(PUBLICATION_STORAGE_KEY, []),
  );
  const [brandSettings, setBrandSettingsState] = useState<BrandSettings>(() =>
    readStorage<BrandSettings>(SETTINGS_STORAGE_KEY, defaultBrandSettings),
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
  if (pathname.startsWith('/settings')) return 'Настройки бренда';
  return 'Dashboard';
}

function DashboardPage() {
  const { agents, properties, publications } = useCrm();
  const stats = getPropertyStats(properties);
  const recentProperties = [...properties].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 4);
  const cards = [
    { label: 'Всего объектов', value: stats.total, icon: Building2 },
    { label: 'На рекламе', value: stats.onAds, icon: Sparkles },
    { label: 'Сдано', value: stats.rented, icon: Check },
    { label: 'Продано', value: stats.sold, icon: Handshake },
    { label: 'Эксклюзивы', value: stats.exclusive, icon: ShieldCheck },
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
          district: existingProperty.district,
          metro: existingProperty.metro,
          address: existingProperty.address,
          building: existingProperty.building,
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
          heating: existingProperty.heating,
          airConditioner: existingProperty.airConditioner,
          balcony: existingProperty.balcony,
          elevator: existingProperty.elevator,
          parking: existingProperty.parking,
          dishwasher: existingProperty.dishwasher,
          oven: existingProperty.oven,
          stove: existingProperty.stove,
          fridge: existingProperty.fridge,
          washingMachine: existingProperty.washingMachine,
          internet: existingProperty.internet,
          petPolicy: existingProperty.petPolicy,
          rentalTerm: existingProperty.rentalTerm,
          deposit: existingProperty.deposit,
          clientCommission: '0%',
          ownerCommission: existingProperty.ownerCommission,
          agent: existingProperty.agent,
          operator: existingProperty.operator,
          owner: existingProperty.owner,
          ownerPhone: existingProperty.ownerPhone,
          ownerTelegram: existingProperty.ownerTelegram,
          status: existingProperty.status,
          exclusive: existingProperty.exclusive,
          internalNotes: existingProperty.internalNotes,
          photos: existingProperty.photos,
          mainPhotoId: existingProperty.mainPhotoId,
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
      titleRu: form.titleRu.trim() || `${form.category} ${form.dealType === 'Аренда' ? 'в аренду' : 'на продажу'} в ${form.district}`,
      titleEn:
        form.titleEn.trim() ||
        `Beautiful ${form.category.toLowerCase()} for ${form.dealType === 'Аренда' ? 'rent' : 'sale'} in ${form.district}`,
      address: form.address.trim(),
      district: form.district.trim(),
      price: form.price.trim(),
      area: form.area.trim(),
      agent: form.agent.trim(),
      operator: form.operator.trim(),
      owner: form.owner.trim(),
      ownerPhone: form.ownerPhone.trim(),
      ownerTelegram: form.ownerTelegram.trim(),
      mainPhotoId: form.mainPhotoId || form.photos[0]?.id || '',
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
          <label>
            Агент
            <input value={form.agent} onChange={(event) => updateField('agent', event.target.value)} />
          </label>
          <label>
            Оператор
            <input value={form.operator} onChange={(event) => updateField('operator', event.target.value)} />
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

function PostPreviewPage() {
  const { addPublication, brandSettings, properties, publications, showToast } = useCrm();
  const searchParams = new URLSearchParams(useLocation().search);
  const initialPropertyId = searchParams.get('property') || properties[0]?.id || '';
  const [selectedPropertyId, setSelectedPropertyId] = useState(initialPropertyId);
  const selectedProperty = properties.find((property) => property.id === selectedPropertyId) || properties[0];
  const [language, setLanguage] = useState<PostLanguage>('EN');
  const [templateType, setTemplateType] = useState<DealType>(selectedProperty?.dealType || 'Аренда');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedProperty) setTemplateType(selectedProperty.dealType);
  }, [selectedProperty]);

  const postText = selectedProperty ? buildTelegramPost(selectedProperty, brandSettings, language, templateType) : '';

  async function copyPost() {
    await copyText(postText);
    setCopied(true);
    showToast('Пост скопирован');
    if (selectedProperty) {
      addPublication({
        id: crypto.randomUUID(),
        propertyId: selectedProperty.id,
        propertyTitle: selectedProperty.titleRu || selectedProperty.address,
        date: new Date().toISOString(),
        channel: brandSettings.telegramChannelId || 'Demo channel',
        status: 'скопировано',
        text: postText,
      });
    }
    window.setTimeout(() => setCopied(false), 2000);
  }

  function saveDraft() {
    if (!selectedProperty) return;
    addPublication({
      id: crypto.randomUUID(),
      propertyId: selectedProperty.id,
      propertyTitle: selectedProperty.titleRu || selectedProperty.address,
      date: new Date().toISOString(),
      channel: brandSettings.telegramChannelId || 'Demo channel',
      status: 'черновик',
      text: postText,
    });
    showToast('Пост сохранен в истории');
  }

  function publishDemo() {
    if (!selectedProperty) return;
    addPublication({
      id: crypto.randomUUID(),
      propertyId: selectedProperty.id,
      propertyTitle: selectedProperty.titleRu || selectedProperty.address,
      date: new Date().toISOString(),
      channel: brandSettings.telegramChannelId || 'Backend not connected',
      status: 'ошибка',
      text: postText,
    });
    showToast('Telegram backend пока не подключен', 'warning');
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
                <button className="secondaryButton dangerText" onClick={publishDemo} type="button">
                  <MessageCircle size={18} />
                  Опубликовать в Telegram
                </button>
              </div>
            </>
          )}

          <PublicationHistory publications={publications.slice(0, 6)} />
        </div>

        <PhonePreview copied={copied} postText={postText} property={selectedProperty} />
      </section>
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
            <h2>Demo Mode</h2>
            <p>Backend для реальной отправки пока не подключен. Используйте копирование текста и ручную публикацию.</p>
          </div>
          <span className="status status-на-рекламе">{brandSettings.telegramChannelId || 'Demo channel'}</span>
        </div>
        <div className="telegramModes">
          <InfoItem label="Режим 1" value="Demo Mode: копирование поста, фото и ручное открытие Telegram" />
          <InfoItem label="Режим 2" value="Backend Mode: POST /api/telegram/publish через серверный endpoint" />
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
                <th>Канал</th>
                <th>Статус</th>
                <th>Текст</th>
              </tr>
            </thead>
            <tbody>
              {publications.map((publication) => (
                <tr key={publication.id}>
                  <td>{new Date(publication.date).toLocaleString('ru-RU')}</td>
                  <td>{publication.propertyTitle}</td>
                  <td>{publication.channel}</td>
                  <td>{publication.status}</td>
                  <td>
                    <span>{publication.text.slice(0, 90)}...</span>
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
            <p>Для production Bot Token должен храниться только на backend, не во фронтенде.</p>
          </div>
        </div>
        <div className="formGrid">
          <label className="wideField">
            Telegram Bot Token
            <input
              placeholder="Хранить только на backend"
              value={form.telegramBotToken}
              onChange={(event) => setForm((current) => ({ ...current, telegramBotToken: event.target.value }))}
            />
          </label>
          <label>
            Telegram Channel ID
            <input
              value={form.telegramChannelId}
              onChange={(event) => setForm((current) => ({ ...current, telegramChannelId: event.target.value }))}
            />
          </label>
          <label>
            Основной контакт
            <input value={form.mainContact} onChange={(event) => setForm((current) => ({ ...current, mainContact: event.target.value }))} />
          </label>
          <label>
            Телефон
            <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
          </label>
          <label>
            Подпись агента
            <input value={form.agentSignature} onChange={(event) => setForm((current) => ({ ...current, agentSignature: event.target.value }))} />
          </label>
          <label>
            Подпись оператора
            <input
              value={form.operatorSignature}
              onChange={(event) => setForm((current) => ({ ...current, operatorSignature: event.target.value }))}
            />
          </label>
        </div>
        <div className="settingsNotice">
          <ShieldCheck size={18} />
          <span>Backend Mode ожидает endpoint POST /api/telegram/publish и переменные TELEGRAM_BOT_TOKEN / TELEGRAM_CHANNEL_ID.</span>
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
  isOpen,
  onCancel,
  onConfirm,
  text,
  title,
}: {
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
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}
