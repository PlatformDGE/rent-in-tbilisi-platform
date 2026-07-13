import {
  AGENT_STORAGE_KEY,
  CLIENT_STORAGE_KEY,
  DEAL_STORAGE_KEY,
  OWNER_STORAGE_KEY,
  PROPERTY_STORAGE_KEY,
  PUBLICATION_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
} from './constants';
import { normalizeAgent, normalizeBrandSettings, normalizeProperty, normalizePublication } from './normalizers';
import type { Agent, BrandSettings, Client, Deal, Owner, Property, Publication } from './types';

const legacySeedIds = {
  properties: new Set(Array.from({ length: 10 }, (_, index) => `RIT-${1001 + index}`)),
  agents: new Set(Array.from({ length: 5 }, (_, index) => `agent-${index + 1}`)),
  owners: new Set(Array.from({ length: 5 }, (_, index) => `owner-${index + 1}`)),
  clients: new Set(Array.from({ length: 5 }, (_, index) => `client-${index + 1}`)),
  deals: new Set(Array.from({ length: 5 }, (_, index) => `deal-${index + 1}`)),
  publications: new Set(Array.from({ length: 5 }, (_, index) => `pub-${index + 1}`)),
};

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = window.localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

export function loadProperties() {
  const saved = readStorage<Partial<Property>[]>(PROPERTY_STORAGE_KEY, []);
  return Array.isArray(saved) ? saved.map(normalizeProperty).filter((item) => !legacySeedIds.properties.has(item.id)) : [];
}

export function loadAgents() {
  const saved = readStorage<Partial<Agent>[]>(AGENT_STORAGE_KEY, []);
  return Array.isArray(saved) ? saved.map(normalizeAgent).filter((item) => !legacySeedIds.agents.has(item.id)) : [];
}

export function loadOwners() {
  const saved = readStorage<Owner[]>(OWNER_STORAGE_KEY, []);
  return Array.isArray(saved) ? saved.filter((item) => !legacySeedIds.owners.has(item.id)) : [];
}

export function loadClients() {
  const saved = readStorage<Client[]>(CLIENT_STORAGE_KEY, []);
  return Array.isArray(saved) ? saved.filter((item) => !legacySeedIds.clients.has(item.id)) : [];
}

export function loadDeals() {
  const saved = readStorage<Deal[]>(DEAL_STORAGE_KEY, []);
  return Array.isArray(saved) ? saved.filter((item) => !legacySeedIds.deals.has(item.id)) : [];
}

export function loadPublications() {
  const saved = readStorage<Partial<Publication>[]>(PUBLICATION_STORAGE_KEY, []);
  return Array.isArray(saved) ? saved.map(normalizePublication).filter((item) => !legacySeedIds.publications.has(item.id)) : [];
}

export function loadBrandSettings(defaultSettings: BrandSettings) {
  return normalizeBrandSettings(readStorage<Partial<BrandSettings>>(SETTINGS_STORAGE_KEY, defaultSettings));
}
