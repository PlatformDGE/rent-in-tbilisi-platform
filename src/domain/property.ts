export const PROPERTY_STATUSES = ['Новый', 'Проверка', 'Закреплён', 'Нужна фотосъёмка', 'Фото готовы', 'Готов к публикации', 'Опубликован', 'Обновление', 'Показ', 'Переговоры', 'Договор', 'Сдан', 'Продан', 'Архив', 'Отклонён'] as const;
export type PropertyStatus = typeof PROPERTY_STATUSES[number];

export const PROPERTY_SOURCES = ['Сайт', 'Рекомендация', 'Звонок', 'Социальные сети', 'Другое'] as const;
export const PROPERTY_TYPES = ['Квартира', 'Дом', 'Коммерческая недвижимость', 'Земельный участок', 'Другое'] as const;
export const CURRENCIES = ['USD', 'GEL', 'EUR'] as const;
export type PropertySource = typeof PROPERTY_SOURCES[number];
export type PropertyType = typeof PROPERTY_TYPES[number];
export type Currency = typeof CURRENCIES[number];
export type HistoryField = 'Создание' | 'Цена' | 'Статус' | 'Собственник' | 'Агент';

export type PropertyHistoryEntry = {
  id: string;
  field: HistoryField;
  previousValue: string;
  newValue: string;
  createdAt: string;
  action: string;
  author: 'Пользователь';
};

export type Property = {
  id: string;
  internalId: string;
  source: PropertySource;
  sourceUrl: string;
  address: string;
  district: string;
  propertyType: PropertyType;
  rooms: number | null;
  bedrooms: number | null;
  area: number | null;
  floor: number | null;
  totalFloors: number | null;
  price: number;
  currency: Currency;
  cadastralNumber: string;
  ownerName: string;
  ownerPhone: string;
  agent: string;
  comment: string;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
  history: PropertyHistoryEntry[];
};

export type PropertyInput = Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'history'>;

export const EMPTY_PROPERTY_INPUT: PropertyInput = {
  internalId: '', source: 'Сайт', sourceUrl: '', address: '', district: '', propertyType: 'Квартира',
  rooms: null, bedrooms: null, area: null, floor: null, totalFloors: null, price: 0, currency: 'USD',
  cadastralNumber: '', ownerName: '', ownerPhone: '', agent: '', comment: '', status: 'Новый',
};
