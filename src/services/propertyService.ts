import type { HistoryField, Property, PropertyHistoryEntry, PropertyInput } from '../domain/property';
import type { PropertyRepository } from '../repositories/propertyRepository';

const id = () => crypto.randomUUID();
const normalize = (input: PropertyInput): PropertyInput => ({
  ...input,
  internalId: input.internalId.trim(), sourceUrl: input.sourceUrl.trim(), address: input.address.trim(),
  district: input.district.trim(), cadastralNumber: input.cadastralNumber.trim(), ownerName: input.ownerName.trim(),
  ownerPhone: input.ownerPhone.trim(), agent: input.agent.trim(), comment: input.comment.trim(),
});
const history = (field: HistoryField, previousValue: string, newValue: string, action: string): PropertyHistoryEntry => ({ id: id(), field, previousValue, newValue, createdAt: new Date().toISOString(), action, author: 'Пользователь' });

export const validateProperty = (input: PropertyInput) => {
  const errors: Partial<Record<keyof PropertyInput, string>> = {};
  if (!input.internalId.trim()) errors.internalId = 'Укажите внутренний ID.';
  if (!input.address.trim()) errors.address = 'Укажите адрес.';
  if (!input.district.trim()) errors.district = 'Укажите район.';
  if (input.price <= 0) errors.price = 'Цена должна быть больше нуля.';
  for (const key of ['rooms', 'bedrooms', 'area', 'floor', 'totalFloors'] as const) if (input[key] !== null && input[key]! < 0) errors[key] = 'Значение не может быть отрицательным.';
  if (input.rooms !== null && input.bedrooms !== null && input.bedrooms > input.rooms) errors.bedrooms = 'Спален не может быть больше, чем комнат.';
  if (input.floor !== null && input.totalFloors !== null && input.floor > input.totalFloors) errors.floor = 'Этаж не может быть выше этажности.';
  if (input.sourceUrl.trim()) { try { new URL(input.sourceUrl); } catch { errors.sourceUrl = 'Введите корректную ссылку.'; } }
  return errors;
};

export class PropertyService {
  constructor(private repository: PropertyRepository) {}
  create(raw: PropertyInput) {
    const input = normalize(raw);
    if (this.repository.findDuplicates(input.internalId, '').length) throw new Error('Объект с таким внутренним ID уже существует.');
    const now = new Date().toISOString();
    const property: Property = { ...input, id: id(), createdAt: now, updatedAt: now, history: [history('Создание', '', input.internalId, 'Создание объекта')] };
    this.repository.save(property); return property;
  }
  update(current: Property, raw: PropertyInput, action = 'Редактирование объекта') {
    const input = normalize(raw);
    if (this.repository.findDuplicates(input.internalId, '', current.id).length) throw new Error('Объект с таким внутренним ID уже существует.');
    const entries: PropertyHistoryEntry[] = [];
    const add = (field: HistoryField, before: string, after: string) => { if (before !== after) entries.push(history(field, before, after, action)); };
    add('Цена', `${current.price} ${current.currency}`, `${input.price} ${input.currency}`);
    add('Статус', current.status, input.status);
    add('Собственник', `${current.ownerName} · ${current.ownerPhone}`, `${input.ownerName} · ${input.ownerPhone}`);
    add('Агент', current.agent || 'Не назначен', input.agent || 'Не назначен');
    const updated: Property = { ...current, ...input, updatedAt: new Date().toISOString(), history: [...entries, ...current.history] };
    this.repository.save(updated); return updated;
  }
}

export const propertyService = (repository: PropertyRepository) => new PropertyService(repository);
