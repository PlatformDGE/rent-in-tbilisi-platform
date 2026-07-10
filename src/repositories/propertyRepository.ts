import type { Property } from '../domain/property';

export interface PropertyRepository {
  list(): Property[];
  getById(id: string): Property | null;
  save(property: Property): void;
  findDuplicates(internalId: string, sourceUrl: string, excludeId?: string): Property[];
}

type StorageSchema = { version: 1; properties: Property[] };
const STORAGE_KEY = 'rent-in-tbilisi:properties:v1';

export class PropertyStorageError extends Error {}

export class LocalStoragePropertyRepository implements PropertyRepository {
  private read(): StorageSchema {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { version: 1, properties: [] };
      const data: unknown = JSON.parse(raw);
      if (!data || typeof data !== 'object' || !('version' in data) || !('properties' in data) || data.version !== 1 || !Array.isArray(data.properties)) throw new Error();
      return data as StorageSchema;
    } catch {
      throw new PropertyStorageError('Локальные данные объектов повреждены. Очистите данные сайта или обратитесь к администратору.');
    }
  }

  list() { return this.read().properties; }
  getById(id: string) { return this.list().find((property) => property.id === id) ?? null; }
  save(property: Property) {
    const schema = this.read();
    const index = schema.properties.findIndex((item) => item.id === property.id);
    if (index >= 0) schema.properties[index] = property; else schema.properties.push(property);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(schema)); }
    catch { throw new PropertyStorageError('Не удалось сохранить объект. Проверьте доступное место и настройки браузера.'); }
  }
  findDuplicates(internalId: string, sourceUrl: string, excludeId?: string) {
    const normalizedId = internalId.trim().toLocaleLowerCase('ru');
    const normalizedUrl = sourceUrl.trim().toLocaleLowerCase('ru');
    return this.list().filter((item) => item.id !== excludeId && (
      item.internalId.trim().toLocaleLowerCase('ru') === normalizedId ||
      Boolean(normalizedUrl && item.sourceUrl.trim().toLocaleLowerCase('ru') === normalizedUrl)
    ));
  }
}

export const propertyRepository = new LocalStoragePropertyRepository();
