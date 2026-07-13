export const CURRENT_USER = {
  name: 'Irakli',
  role: 'Управление платформой',
} as const;

export const TELEGRAM_ASSET_BASE_URL = import.meta.env.VITE_TELEGRAM_ASSET_BASE_URL
  || 'https://platformdge.github.io/-rentintbilisi-crm/';
