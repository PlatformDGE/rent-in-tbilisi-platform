import { CircleAlert, RotateCcw } from 'lucide-react';
export function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return <main className="status-screen"><div className="status-screen__icon status-screen__icon--error"><CircleAlert /></div><h1>Что-то пошло не так</h1><p>Интерфейс не удалось загрузить. Обновите страницу и попробуйте снова.</p><button className="button" type="button" onClick={onRetry}><RotateCcw size={17} /> Повторить</button></main>;
}
