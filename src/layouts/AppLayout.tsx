import { Outlet } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { Sidebar } from './Sidebar';
export function AppLayout() {
  return <div className="app-shell"><Sidebar /><main className="app-content"><div className="mobile-header"><strong>Rent in Tbilisi</strong><span>Платформа аренды</span></div><Outlet /></main><BottomNavigation /></div>;
}
