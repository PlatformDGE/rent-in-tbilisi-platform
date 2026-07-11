import { Building2, Grid2X2, List, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CURRENCIES, PROPERTY_SOURCES, PROPERTY_STATUSES, type Property } from '../../domain/property';
import { PropertyStorageError } from '../../repositories/propertyRepository';
import { propertyAccessService } from '../../services/propertyAccessService';
import { currentUserService } from '../../services/currentUserService';
import { formatDate, formatPrice, statusClass } from './property.formatters';
import { getTaxonomyLabel } from '../../services/publicationTaxonomy';
import './properties.css';

type SortKey = 'updatedAt' | 'price' | 'address' | 'internalId';
export default function PropertiesPage() {
  const [query, setQuery] = useState(''); const [status, setStatus] = useState(''); const [district, setDistrict] = useState('');
  const [source, setSource] = useState(''); const [agent, setAgent] = useState(''); const [type, setType] = useState(''); const [currency, setCurrency] = useState('');
  const [sort, setSort] = useState<SortKey>('updatedAt'); const [direction, setDirection] = useState<'asc' | 'desc'>('desc');
  const [view, setView] = useState<'table' | 'cards'>(() => { try { return localStorage.getItem('properties:view') === 'cards' ? 'cards' : 'table'; } catch { return 'table'; } });
  let properties: Property[] = []; let error = '';
  const currentUser=currentUserService.getCurrentUser();
  try { properties = propertyAccessService.list(currentUser); } catch (reason) { error = reason instanceof PropertyStorageError ? reason.message : 'Не удалось загрузить объекты.'; }
  const districts = [...new Set(properties.map((item) => item.districtId).filter(Boolean))].sort();
  const agents = [...new Set(properties.map((item) => item.agentHashtag).filter(Boolean))].sort();
  const types = [...new Set(properties.map((item) => item.commercialTypeId||item.residentialSubtypeId||item.propertyTypeId).filter(Boolean))].sort();
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ru');
    return properties.filter((item) => (!needle || [item.internalId, item.address, item.cadastralNumber, item.ownerName, item.ownerPhone,getTaxonomyLabel(item.districtId)].some((value) => value.toLocaleLowerCase('ru').includes(needle))) && (!status || item.status === status) && (!district || item.districtId === district) && (!source || item.source === source) && (!agent || item.agentHashtag === agent) && (!type || [item.propertyTypeId,item.residentialSubtypeId,item.commercialTypeId].includes(type)) && (!currency || item.currency === currency)).sort((a, b) => {
      const av = a[sort]; const bv = b[sort]; const result = typeof av === 'number' ? av - (bv as number) : String(av).localeCompare(String(bv), 'ru'); return direction === 'asc' ? result : -result;
    });
  }, [properties, query, status, district, source, agent, type, currency, sort, direction]);
  const reset = () => { setQuery(''); setStatus(''); setDistrict(''); setSource(''); setAgent(''); setType(''); setCurrency(''); };
  const changeView = (next: 'table' | 'cards') => { setView(next); try { localStorage.setItem('properties:view', next); } catch { /* Вид продолжает работать в текущей сессии. */ } };
  if (error) return <section className="page"><div className="module-error"><h1>Не удалось открыть реестр</h1><p>{error}</p><button className="button" onClick={() => location.reload()}>Повторить</button></div></section>;
  return <section className="page properties-page">
    <header className="page__header"><div><p className="eyebrow">Рабочий раздел</p><h1>Объекты</h1><p>Реестр объектов аренды и продажи.</p></div><Link className="button" to="/properties/new"><Plus size={18}/>Добавить объект</Link></header>
    {properties.length === 0 ? <div className="empty-state"><span className="empty-state__icon"><Building2 /></span><h2>Объектов пока нет</h2><p>Добавьте первый тестовый объект вручную. В реестре нет заранее созданных или демонстрационных данных.</p><Link className="button empty-state__button" to="/properties/new"><Plus size={18}/>Добавить первый объект</Link></div> : <>
      <div className="property-toolbar"><label className="search-field"><Search size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ID, адрес, собственник, телефон…" aria-label="Поиск объектов"/></label><div className="view-switch" aria-label="Режим отображения"><button className={view === 'table' ? 'active' : ''} onClick={() => changeView('table')} title="Таблица"><List size={18}/></button><button className={view === 'cards' ? 'active' : ''} onClick={() => changeView('cards')} title="Карточки"><Grid2X2 size={18}/></button></div></div>
      <div className="property-filters"><span><SlidersHorizontal size={16}/>Фильтры</span><select value={status} onChange={(e)=>setStatus(e.target.value)}><option value="">Все статусы</option>{PROPERTY_STATUSES.map(v=><option key={v}>{v}</option>)}</select><select value={district} onChange={(e)=>setDistrict(e.target.value)}><option value="">Все районы</option>{districts.map(v=><option key={v} value={v}>{getTaxonomyLabel(v)}</option>)}</select><select value={source} onChange={(e)=>setSource(e.target.value)}><option value="">Все источники</option>{PROPERTY_SOURCES.map(v=><option key={v}>{v}</option>)}</select><select value={agent} onChange={(e)=>setAgent(e.target.value)}><option value="">Все агенты</option>{agents.map(v=><option key={v}>{v}</option>)}</select><select value={type} onChange={(e)=>setType(e.target.value)}><option value="">Все типы</option>{types.map(v=><option key={v} value={v}>{getTaxonomyLabel(v)}</option>)}</select><select value={currency} onChange={(e)=>setCurrency(e.target.value)}><option value="">Все валюты</option>{CURRENCIES.map(v=><option key={v}>{v}</option>)}</select><button className="text-button" onClick={reset}><X size={15}/>Сбросить</button></div>
      <div className="registry-meta"><span>Найдено: {filtered.length}</span><div><select value={sort} onChange={(e)=>setSort(e.target.value as SortKey)} aria-label="Сортировка"><option value="updatedAt">Дата обновления</option><option value="price">Цена</option><option value="address">Адрес</option><option value="internalId">Внутренний ID</option></select><button className="text-button" onClick={()=>setDirection(v=>v==='asc'?'desc':'asc')}>{direction === 'asc' ? 'По возрастанию' : 'По убыванию'}</button></div></div>
      {filtered.length === 0 ? <div className="compact-empty"><Search/><h2>Ничего не найдено</h2><p>Измените поисковый запрос или сбросьте фильтры.</p><button className="button button--secondary" onClick={reset}>Сбросить фильтры</button></div> : view === 'table' ? <PropertyTable items={filtered}/> : <div className="property-grid">{filtered.map(item=><PropertyCard key={item.id} item={item}/>)}</div>}
    </>}
  </section>;
}
function PropertyTable({items}:{items:Property[]}) { return <div className="property-table-wrap"><table className="property-table"><thead><tr><th>Объект</th><th>Статус</th><th>Цена</th><th>Район</th><th>Агент</th><th>Источник</th><th>Обновлён</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td><Link to={`/properties/${item.id}`}><strong>{item.internalId}</strong><small>{item.address}</small></Link></td><td><span className={statusClass(item.status)}>{item.status}</span></td><td>{formatPrice(item.price,item.currency)}</td><td>{getTaxonomyLabel(item.districtId)}</td><td>{item.agentHashtag||'Не назначен'}</td><td>{item.source}</td><td>{formatDate(item.updatedAt)}</td></tr>)}</tbody></table></div>; }
function PropertyCard({item}:{item:Property}) { const type=item.commercialTypeId||item.residentialSubtypeId||item.propertyTypeId;return <Link className="property-card" to={`/properties/${item.id}`}><div className="property-card__top"><strong>{item.internalId}</strong><span className={statusClass(item.status)}>{item.status}</span></div><h3>{item.address}</h3><p>{getTaxonomyLabel(item.districtId)} · {getTaxonomyLabel(type)}</p><div className="property-card__price">{formatPrice(item.price,item.currency)}</div><dl><div><dt>Агент</dt><dd>{item.agentHashtag||'Не назначен'}</dd></div><div><dt>Источник</dt><dd>{item.source}</dd></div><div><dt>Обновлён</dt><dd>{formatDate(item.updatedAt)}</dd></div></dl></Link>; }
