import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { LoadingScreen } from '../components/LoadingScreen';
import { RouteErrorScreen } from '../components/RouteErrorScreen';
import { AppLayout } from '../layouts/AppLayout';

const DashboardPage = lazy(() => import('../modules/dashboard/DashboardPage'));
const PropertiesPage = lazy(() => import('../modules/properties/PropertiesPage'));
const PropertyFormPage = lazy(() => import('../modules/properties/PropertyFormPage'));
const PropertyDetailPage = lazy(() => import('../modules/properties/PropertyDetailPage'));
const OwnersPage = lazy(() => import('../modules/owners/OwnersPage'));
const ClientsPage = lazy(() => import('../modules/clients/ClientsPage'));
const ReportsPage = lazy(() => import('../modules/reports/ReportsPage'));
const ContractsPage = lazy(() => import('../modules/contracts/ContractsPage'));
const AgentsPage = lazy(() => import('../modules/agents/AgentsPage'));
const TelegramPage = lazy(() => import('../modules/telegram/TelegramPage'));
const SettingsPage = lazy(() => import('../modules/settings/SettingsPage'));
const withLoading = (page: ReactNode) => <Suspense fallback={<LoadingScreen compact />}>{page}</Suspense>;

export const router = createBrowserRouter([{
  path: '/', element: <AppLayout />, errorElement: <RouteErrorScreen />, children: [
    { index: true, element: withLoading(<DashboardPage />) },
    { path: 'properties', element: withLoading(<PropertiesPage />) },
    { path: 'properties/new', element: withLoading(<PropertyFormPage />) },
    { path: 'properties/:propertyId', element: withLoading(<PropertyDetailPage />) },
    { path: 'properties/:propertyId/edit', element: withLoading(<PropertyFormPage />) },
    { path: 'owners', element: withLoading(<OwnersPage />) },
    { path: 'clients', element: withLoading(<ClientsPage />) },
    { path: 'reports', element: withLoading(<ReportsPage />) },
    { path: 'contracts', element: withLoading(<ContractsPage />) },
    { path: 'agents', element: withLoading(<AgentsPage />) },
    { path: 'telegram', element: withLoading(<TelegramPage />) },
    { path: 'settings', element: withLoading(<SettingsPage />) },
  ],
}], { basename: import.meta.env.BASE_URL });
