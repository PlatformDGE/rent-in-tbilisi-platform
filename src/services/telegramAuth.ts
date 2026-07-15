import type { RegistryRole } from '../domain/telegramRegistry';

export interface TelegramAuthPayload {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface AuthenticatedUser {
  id: string;
  telegramUserId: string;
  telegramUsername: string | null;
  fullName: string;
  role: RegistryRole;
}

export interface AuthSession {
  user: AuthenticatedUser;
  expiresAt: string;
  accessToken: string;
}

export interface TelegramAuthBackend {
  validateTelegramLogin(payload: TelegramAuthPayload): Promise<AuthSession>;
  validateTelegramInitData(initData: string): Promise<AuthSession>;
}

export class PreviewTelegramAuthAdapter implements TelegramAuthBackend {
  constructor(private readonly session: AuthSession) {}
  async validateTelegramLogin(): Promise<AuthSession> { return this.session; }
  async validateTelegramInitData(): Promise<AuthSession> { return this.session; }
}
