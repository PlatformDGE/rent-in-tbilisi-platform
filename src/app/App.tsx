import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ErrorScreen } from '../components/ErrorScreen';
import { router } from './router';

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Ошибка интерфейса', error, info); }
  render() {
    return this.state.hasError
      ? <ErrorScreen onRetry={() => window.location.reload()} />
      : this.props.children;
  }
}

export function App() {
  return <AppErrorBoundary><RouterProvider router={router} /></AppErrorBoundary>;
}
