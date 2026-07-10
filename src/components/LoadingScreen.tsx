export function LoadingScreen({ compact = false }: { compact?: boolean }) {
  return <div className={compact ? 'loading loading--compact' : 'loading'} role="status"><span className="loading__spinner" aria-hidden="true" /><span>Загрузка…</span></div>;
}
