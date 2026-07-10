import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { ErrorScreen } from './ErrorScreen';
export function RouteErrorScreen() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <main className="status-screen"><p className="eyebrow">Ошибка 404</p><h1>Страница не найдена</h1><p>Проверьте адрес или вернитесь на главную страницу.</p><a className="button" href={import.meta.env.BASE_URL}>На главную</a></main>;
  return <ErrorScreen onRetry={() => window.location.reload()} />;
}
