import type { LucideIcon } from 'lucide-react';
export function EmptySection({ title, description, icon: Icon, note }: { title: string; description: string; icon: LucideIcon; note?: string }) {
  return <section className="page"><header className="page__header"><div><p className="eyebrow">Рабочий раздел</p><h1>{title}</h1><p>{description}</p></div></header><div className="empty-state"><span className="empty-state__icon"><Icon /></span><h2>Здесь пока нет данных</h2><p>{note ?? 'Раздел готов к подключению данных в следующем этапе разработки.'}</p></div></section>;
}
