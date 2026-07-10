import { BarChart3, Bot, Building2, FileText, Gauge, Handshake, Settings, UserRound, UsersRound, type LucideIcon } from 'lucide-react';

export type NavigationItem = { label: string; path: string; icon: LucideIcon; mobile?: boolean };

export const navigation: NavigationItem[] = [
  { label: 'Обзор', path: '/', icon: Gauge, mobile: true },
  { label: 'Объекты', path: '/properties', icon: Building2, mobile: true },
  { label: 'Собственники', path: '/owners', icon: Handshake },
  { label: 'Клиенты', path: '/clients', icon: UsersRound, mobile: true },
  { label: 'Отчёты', path: '/reports', icon: BarChart3 },
  { label: 'Договоры', path: '/contracts', icon: FileText, mobile: true },
  { label: 'Агенты', path: '/agents', icon: UserRound },
  { label: 'Telegram', path: '/telegram', icon: Bot },
  { label: 'Настройки', path: '/settings', icon: Settings, mobile: true },
];
