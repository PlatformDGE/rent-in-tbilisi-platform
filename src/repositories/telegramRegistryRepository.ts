import type { TelegramRegistryPayload } from '../domain/telegramRegistry';

const REGISTRY_URL = `${import.meta.env.BASE_URL}telegram-property-registry.json`;

export interface TelegramRegistryRepository {
  load(signal?: AbortSignal): Promise<TelegramRegistryPayload>;
}

export const httpTelegramRegistryRepository: TelegramRegistryRepository = {
  async load(signal) {
    const response = await fetch(`${REGISTRY_URL}?t=${Date.now()}`, { cache: 'no-store', signal });
    if (!response.ok) throw new Error(`Не удалось загрузить реестр: HTTP ${response.status}`);
    const payload = await response.json() as TelegramRegistryPayload;
    if (!Array.isArray(payload.properties) || !Array.isArray(payload.agents)) throw new Error('Некорректный формат Telegram-реестра');
    return payload;
  },
};
