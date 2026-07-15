import type { RegistryRole, TelegramRegistryProperty } from '../domain/telegramRegistry';

export interface RegistryPrincipal {
  id: string;
  role: RegistryRole;
}

export function canReadRegistryProperty(principal: RegistryPrincipal, property: TelegramRegistryProperty) {
  if (principal.role === 'admin' || principal.role === 'operator') return true;
  return property.assignedAgentId === principal.id;
}

export function enforceRegistryAccess(principal: RegistryPrincipal, properties: TelegramRegistryProperty[]) {
  return properties.filter((property) => canReadRegistryProperty(principal, property));
}
