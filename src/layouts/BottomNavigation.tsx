import { NavLink } from 'react-router-dom';
import { navigation } from '../app/navigation';
export function BottomNavigation() {
  return <nav className="bottom-nav" aria-label="Мобильная навигация">{navigation.filter((item) => item.mobile).map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => isActive ? 'bottom-nav__link bottom-nav__link--active' : 'bottom-nav__link'}><Icon size={20} /><span>{label}</span></NavLink>)}</nav>;
}
