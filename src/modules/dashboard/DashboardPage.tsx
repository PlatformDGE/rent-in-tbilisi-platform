import { ArrowRight, Building2, ClipboardList, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
const quickActions = [
  { title: 'Объекты', text: 'Каталог объектов аренды', path: '/properties', icon: Building2 },
  { title: 'Клиенты', text: 'Запросы и контакты клиентов', path: '/clients', icon: UsersRound },
  { title: 'Договоры', text: 'Документы и сроки аренды', path: '/contracts', icon: ClipboardList },
];
export default function DashboardPage() {
  return <section className="page dashboard"><header className="page__header dashboard__header"><div><p className="eyebrow">Панель управления</p><h1>Добро пожаловать</h1><p>Рабочее пространство Rent in Tbilisi готово к настройке.</p></div><span className="stage-badge">Первая версия</span></header><div className="notice-card"><span className="notice-card__icon"><Building2 /></span><div><h2>Начните с подключения данных</h2><p>Каркас не содержит демонстрационных показателей. Реальные данные появятся после подключения источников в отдельных задачах.</p></div></div><div className="section-heading"><div><h2>Рабочие разделы</h2><p>Быстрый переход к основным задачам</p></div></div><div className="quick-grid">{quickActions.map(({ title, text, path, icon: Icon }) => <Link className="quick-card" to={path} key={path}><span className="quick-card__icon"><Icon /></span><div><h3>{title}</h3><p>{text}</p></div><ArrowRight className="quick-card__arrow" size={18} /></Link>)}</div></section>;
}
