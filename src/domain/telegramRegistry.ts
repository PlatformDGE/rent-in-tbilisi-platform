export type RegistryRole = 'agent' | 'operator' | 'admin' | 'recruit';
export type MediaImportStatus = 'media_ready' | 'no_media_in_post' | 'download_failed' | 'storage_failed' | 'invalid_mapping';

export interface TelegramMediaItem {
  id: string;
  type: 'image' | 'video';
  sourceMessageId: string;
  sourceFileId: string;
  originalUrl: string;
  thumbnailUrl: string;
  width: number | null;
  height: number | null;
  order: number;
  isPrimary: boolean;
}

export interface TelegramRegistryAgent {
  id: string;
  telegramUserId: string | null;
  telegramUsername: string | null;
  fullName: string;
  agentHashtag: string;
  role: RegistryRole;
  active: boolean;
}

export interface TelegramRegistryProperty {
  id: string;
  sourceTelegramUrl: string;
  sourceTelegramMessageId: string;
  publishedAt: string;
  editedAt: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  rawText: string;
  caption: string;
  address: string;
  district: string;
  metro: string;
  price: number | null;
  currency: 'USD' | 'GEL' | 'EUR';
  area: number | null;
  floor: number | null;
  totalFloors: number | null;
  bedrooms: number | null;
  propertyType: string;
  assignedAgentId: string | null;
  agentHashtag: string | null;
  googleMapsUrl: string | null;
  coordinates: { latitude: number; longitude: number } | null;
  media: TelegramMediaItem[];
  mediaImportStatus: MediaImportStatus;
  telegramAvailable: boolean;
  lifecycleStatus: 'active' | 'rented' | 'sold' | 'removed';
  repostCount: number;
  highestRank: number | null;
  maxRepostCount: number;
  channelAgeMinutes: number;
}

export interface TelegramRegistryReport {
  processedPublications: number;
  created: number;
  updated: number;
  withRealMedia: number;
  withoutMedia: number;
  mediaErrors: number;
  unassignedAgents: number;
}

export interface TelegramRegistryPayload {
  schemaVersion: number;
  channel: string;
  updatedAt: string;
  agents: TelegramRegistryAgent[];
  properties: TelegramRegistryProperty[];
  report: TelegramRegistryReport;
}
