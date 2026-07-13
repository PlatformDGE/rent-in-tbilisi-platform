import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`uiCard ${className}`.trim()}>{children}</section>;
}

export function SectionHeader({ actions, eyebrow, title, description }: { actions?: ReactNode; eyebrow?: string; title: string; description?: string }) {
  return (
    <header className="sectionHeader">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="sectionActions">{actions}</div>}
    </header>
  );
}

export function MetricCard({ icon, label, value, detail }: { icon: ReactNode; label: string; value: ReactNode; detail?: string }) {
  return (
    <article className="metricCard">
      <span className="metricIcon">{icon}</span>
      <div><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div>
    </article>
  );
}

export function LoadingState({ label = 'Загрузка…' }: { label?: string }) {
  return <div className="loadingState"><span className="loadingSpinner" />{label}</div>;
}

export function EmptyStateCard({ title, text }: { title: string; text: string }) {
  return <div className="emptyStateCard"><strong>{title}</strong><span>{text}</span></div>;
}
