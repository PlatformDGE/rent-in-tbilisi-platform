import { NavLink } from 'react-router-dom';
import { navigation } from '../app/navigation';
import { Brand } from '../components/Brand';
import { currentUserService } from '../services/currentUserService';
import { moderationService } from '../services/moderationService';
export function Sidebar() {
  const user=currentUserService.getCurrentUser();const pending=moderationService.pendingCount(user);
  return <aside className="sidebar"><Brand /><nav className="sidebar__nav" aria-label="Основная навигация">{navigation.filter(item=>!item.roles||item.roles.includes(user.role)).map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}><Icon size={19} /><span>{label}</span>{path==='/moderation'&&pending>0&&<b className="nav-count">{pending}</b>}</NavLink>)}</nav><div className="sidebar__footer"><span className="status-dot" /> {user.fullName}</div></aside>;
}
