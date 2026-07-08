import {
  AGENT_STORAGE_KEY,
  CLIENT_STORAGE_KEY,
  DEAL_STORAGE_KEY,
  OWNER_STORAGE_KEY,
  PROPERTY_STORAGE_KEY,
  PUBLICATION_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
} from './constants';
import { seedProperties, starterAgents, starterClients, starterDeals, starterOwners, starterPublications } from './demoData';
import { mergeById, normalizeAgent, normalizeBrandSettings, normalizeProperty, normalizePublication } from './normalizers';
import type { Agent, BrandSettings, Client, Deal, Owner, Property, Publication } from './types';

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
  const saved = readStorage<Partial<Property>[]>(PROPERTY_STORAGE_KEY, seedProperties);
  const normalized = Array.isArray(saved) && saved.length > 0 ? saved.map(normalizeProperty) : seedProperties;
  return mergeById(normalized, seedProperties);
}

export function loadAgents() {
  const saved = readStorage<Partial<Agent>[]>(AGENT_STORAGE_KEY, starterAgents);
  const normalized = Array.isArray(saved) && saved.length > 0 ? saved.map(normalizeAgent) : starterAgents;
  return mergeById(normalized, starterAgents);
}

export function loadOwners() {
  return mergeById(readStorage<Owner[]>(OWNER_STORAGE_KEY, starterOwners), starterOwners);
}

export function loadClients() {
  return mergeById(readStorage<Client[]>(CLIENT_STORAGE_KEY, starterClients), starterClients);
}

export function loadDeals() {
  return mergeById(readStorage<Deal[]>(DEAL_STORAGE_KEY, starterDeals), starterDeals);
}

export function loadPublications() {
  return mergeById(
    readStorage<Partial<Publication>[]>(PUBLICATION_STORAGE_KEY, starterPublications).map(normalizePublication),
    starterPublications,
  );
}

export function loadBrandSettings(defaultSettings: BrandSettings) {
  return normalizeBrandSettings(readStorage<Partial<BrandSettings>>(SETTINGS_STORAGE_KEY, defaultSettings));
}
