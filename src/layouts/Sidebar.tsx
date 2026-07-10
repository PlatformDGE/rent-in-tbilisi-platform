import { NavLink } from 'react-router-dom';
import { navigation } from '../app/navigation';
import { Brand } from '../components/Brand';
export function Sidebar() {
  return <aside className="sidebar"><Brand /><nav className="sidebar__nav" aria-label="Основная навигация">{navigation.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}><Icon size={19} /><span>{label}</span></NavLink>)}</nav><div className="sidebar__footer"><span className="status-dot" /> Каркас платформы</div></aside>;
}
