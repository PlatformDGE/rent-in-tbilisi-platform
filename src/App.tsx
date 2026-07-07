import {
  ArrowLeft,
  BarChart3,
  Building2,
  Handshake,
  Home,
  KeyRound,
  LogOut,
  Moon,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sun,
  Trash2,
  UserCheck,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { FormEvent, ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

type DealType = 'Аренда' | 'Продажа';
type PropertyStatus = 'Новый' | 'В работе' | 'Сдан' | 'Продан' | 'Архив';
type TeamRole =
  | 'Рекрут 20%'
  | 'Рекрут 1.5 50%'
  | 'Агент 50%'
  | 'Агент 70%'
  | 'Агент 90%'
  | 'Оператор'
  | 'Администратор';
type AuthRole = 'Администратор' | 'Оператор' | 'Агент';
type ThemeMode = 'light' | 'dark';

type Property = {
  id: string;
  address: string;
  district: string;
  dealType: DealType;
  price: string;
  area: string;
  bedrooms: string;
  floor: string;
  status: PropertyStatus;
  agent: string;
  owner: string;
  photoUrl: string;
  notes: string;
  createdAt: string;
};

type PropertyFormState = Omit<Property, 'id' | 'createdAt'>;

type Agent = {
  id: string;
  name: string;
  telegram: string;
  phone: string;
  role: TeamRole;
  dealsCount: number;
  exclusiveCount: number;
  commissionPercent: number;
  isActive: boolean;
};

type Session = {
  name: string;
  role: AuthRole;
};

type CrmContextValue = {
  agents: Agent[];
  deleteProperty: (id: string) => void;
  properties: Property[];
  session: Session | null;
  setSession: (session: Session | null) => void;
  setTheme: (theme: ThemeMode) => void;
  theme: ThemeMode;
  upsertProperty: (property: Property) => void;
};

const PROPERTY_STORAGE_KEY = 'molecula-crm-properties';
const AGENT_STORAGE_KEY = 'molecula-crm-agents';
const SESSION_STORAGE_KEY = 'molecula-crm-session';
const THEME_STORAGE_KEY = 'molecula-crm-theme';

const dealTypes: DealType[] = ['Аренда', 'Продажа'];
const propertyStatuses: PropertyStatus[] = ['Новый', 'В работе', 'Сдан', 'Продан', 'Архив'];
const authRoles: AuthRole[] = ['Администратор', 'Оператор', 'Агент'];
const teamRoles: TeamRole[] = [
  'Рекрут 20%',
  'Рекрут 1.5 50%',
  'Агент 50%',
  'Агент 70%',
  'Агент 90%',
  'Оператор',
  'Администратор',
];

const emptyProperty: PropertyFormState = {
  address: '',
  district: '',
  dealType: 'Аренда',
  price: '',
  area: '',
  bedrooms: '',
  floor: '',
  status: 'Новый',
  agent: '',
  owner: '',
  photoUrl: '',
  notes: '',
};

const starterProperties: Property[] = [
  {
    id: 'starter-1',
    address: 'Ilia Chavchavadze Ave 37',
    district: 'Vake',
    dealType: 'Аренда',
    price: '1 200 $',
    area: '72 м2',
    bedrooms: '2',
    floor: '8/12',
    status: 'В работе',
    agent: 'Nino Beridze',
    owner: 'Giorgi Maisuradze',
    photoUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
    notes: 'Светлая квартира рядом с парком, готова к показам.',
    createdAt: '2026-07-01T10:00:00.000Z',
  },
  {
    id: 'starter-2',
    address: 'Atoneli St 12',
    district: 'Sololaki',
    dealType: 'Продажа',
    price: '185 000 $',
    area: '96 м2',
    bedrooms: '3',
    floor: '3/5',
    status: 'Продан',
    agent: 'David Kapanadze',
    owner: 'Mariam Janelidze',
    photoUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3',
    notes: 'Исторический дом, высокий потолок, закрыта продажа.',
    createdAt: '2026-06-28T12:20:00.000Z',
  },
  {
    id: 'starter-3',
    address: 'Gorgasali St 58',
    district: 'Ortachala',
    dealType: 'Аренда',
    price: '850 $',
    area: '61 м2',
    bedrooms: '1',
    floor: '6/10',
    status: 'Сдан',
    agent: 'Ana Lomidze',
    owner: 'Irakli Nadiradze',
    photoUrl: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154',
    notes: 'Сдано экспату, договор на 12 месяцев.',
    createdAt: '2026-06-20T09:10:00.000Z',
  },
  {
    id: 'starter-4',
    address: 'Bakhtrioni St 22',
    district: 'Saburtalo',
    dealType: 'Продажа',
    price: '132 000 $',
    area: '84 м2',
    bedrooms: '2',
    floor: '11/16',
    status: 'Архив',
    agent: 'Sandro Gelashvili',
    owner: 'Natia Dolidze',
    photoUrl: '',
    notes: 'Собственник временно снял объект с рынка.',
    createdAt: '2026-06-10T16:00:00.000Z',
  },
];

const starterAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Nino Beridze',
    telegram: '@nino_molecula',
    phone: '+995 599 10 20 30',
    role: 'Агент 70%',
    dealsCount: 18,
    exclusiveCount: 9,
    commissionPercent: 70,
    isActive: true,
  },
  {
    id: 'agent-2',
    name: 'David Kapanadze',
    telegram: '@david_rent',
    phone: '+995 577 44 55 66',
    role: 'Агент 90%',
    dealsCount: 31,
    exclusiveCount: 14,
    commissionPercent: 90,
    isActive: true,
  },
  {
    id: 'agent-3',
    name: 'Ana Lomidze',
    telegram: '@ana_molecula',
    phone: '+995 555 77 88 90',
    role: 'Агент 50%',
    dealsCount: 11,
    exclusiveCount: 5,
    commissionPercent: 50,
    isActive: true,
  },
  {
    id: 'agent-4',
    name: 'Sandro Gelashvili',
    telegram: '@sandro_ops',
    phone: '+995 599 91 82 73',
    role: 'Оператор',
    dealsCount: 4,
    exclusiveCount: 2,
    commissionPercent: 0,
    isActive: true,
  },
  {
    id: 'agent-5',
    name: 'Mariam Abashidze',
    telegram: '@mariam_recruit',
    phone: '+995 598 11 22 33',
    role: 'Рекрут 20%',
    dealsCount: 2,
    exclusiveCount: 1,
    commissionPercent: 20,
    isActive: true,
  },
  {
    id: 'agent-6',
    name: 'Giorgi Chikovani',
    telegram: '@giorgi_recruit15',
    phone: '+995 551 99 00 12',
    role: 'Рекрут 1.5 50%',
    dealsCount: 6,
    exclusiveCount: 3,
    commissionPercent: 50,
    isActive: false,
  },
  {
    id: 'agent-7',
    name: 'Luka Tsereteli',
    telegram: '@luka_admin',
    phone: '+995 555 12 34 56',
    role: 'Администратор',
    dealsCount: 24,
    exclusiveCount: 12,
    commissionPercent: 0,
    isActive: true,
  },
];

const CrmContext = createContext<CrmContextValue | null>(null);

function useCrm() {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used inside CrmContext');
  }
  return context;
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = window.localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

function normalizeProperty(property: Partial<Property>, index: number): Property {
  return {
    ...emptyProperty,
    id: property.id || `imported-${index}-${Date.now()}`,
    createdAt: property.createdAt || new Date().toISOString(),
    address: property.address || '',
    district: property.district || '',
    dealType: dealTypes.includes(property.dealType as DealType) ? (property.dealType as DealType) : 'Аренда',
    price: property.price || '',
    area: property.area || '',
    bedrooms: property.bedrooms || '',
    floor: property.floor || '',
    status: propertyStatuses.includes(property.status as PropertyStatus)
      ? (property.status as PropertyStatus)
      : 'Новый',
    agent: property.agent || '',
    owner: property.owner || '',
    photoUrl: property.photoUrl || '',
    notes: property.notes || '',
  };
}

function loadProperties() {
  const saved = readStorage<Partial<Property>[]>(PROPERTY_STORAGE_KEY, starterProperties);
  return Array.isArray(saved) ? saved.map(normalizeProperty) : starterProperties;
}

function normalizeAgent(agent: Partial<Agent>, index: number): Agent {
  return {
    id: agent.id || `agent-imported-${index}-${Date.now()}`,
    name: agent.name || '',
    telegram: agent.telegram || '',
    phone: agent.phone || '',
    role: teamRoles.includes(agent.role as TeamRole) ? (agent.role as TeamRole) : 'Агент 50%',
    dealsCount: Number(agent.dealsCount || 0),
    exclusiveCount: Number(agent.exclusiveCount || 0),
    commissionPercent: Number(agent.commissionPercent || 0),
    isActive: Boolean(agent.isActive),
  };
}

function loadAgents() {
  const saved = readStorage<Partial<Agent>[]>(AGENT_STORAGE_KEY, starterAgents);
  return Array.isArray(saved) ? saved.map(normalizeAgent) : starterAgents;
}

function statusClassName(status: PropertyStatus) {
  return `status status-${status.toLowerCase().replace(/\s+/g, '-')}`;
}

function getPropertyStats(properties: Property[]) {
  return {
    total: properties.length,
    inWork: properties.filter((property) => property.status === 'В работе').length,
    rented: properties.filter((property) => property.status === 'Сдан').length,
    sold: properties.filter((property) => property.status === 'Продан').length,
    archived: properties.filter((property) => property.status === 'Архив').length,
  };
}

function getDealCount(properties: Property[]) {
  return properties.filter((property) => property.status === 'Сдан' || property.status === 'Продан').length;
}

function getDistricts(properties: Property[]) {
  return Array.from(new Set(properties.map((property) => property.district).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function AppProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(loadProperties);
  const [agents] = useState<Agent[]>(loadAgents);
  const [session, setSessionState] = useState<Session | null>(() =>
    readStorage<Session | null>(SESSION_STORAGE_KEY, null),
  );
  const [theme, setThemeState] = useState<ThemeMode>(() => readStorage<ThemeMode>(THEME_STORAGE_KEY, 'light'));

  useEffect(() => {
    window.localStorage.setItem(PROPERTY_STORAGE_KEY, JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    window.localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  }, [theme]);

  function setSession(nextSession: Session | null) {
    setSessionState(nextSession);
    if (nextSession) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  function upsertProperty(nextProperty: Property) {
    setProperties((current) => {
      const exists = current.some((property) => property.id === nextProperty.id);
      if (!exists) return [nextProperty, ...current];
      return current.map((property) => (property.id === nextProperty.id ? nextProperty : property));
    });
  }

  function deleteProperty(id: string) {
    setProperties((current) => current.filter((property) => property.id !== id));
  }

  const value = useMemo(
    () => ({
      agents,
      deleteProperty,
      properties,
      session,
      setSession,
      setTheme: setThemeState,
      theme,
      upsertProperty,
    }),
    [agents, properties, session, theme],
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/new" element={<PropertyFormPage mode="create" />} />
            <Route path="/properties/:propertyId" element={<PropertyDetailPage />} />
            <Route path="/properties/:propertyId/edit" element={<PropertyFormPage mode="edit" />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agents/:agentId" element={<AgentDetailPage />} />
            <Route path="/deals" element={<SimpleSectionPage title="Сделки" icon={Handshake} />} />
            <Route path="/owners" element={<SimpleSectionPage title="Собственники" icon={Home} />} />
            <Route path="/clients" element={<SimpleSectionPage title="Клиенты" icon={UserRound} />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

function LoginPage() {
  const { session, setSession, setTheme, theme } = useCrm();
  const navigate = useNavigate();
  const [name, setName] = useState('Molecula Admin');
  const [role, setRole] = useState<AuthRole>('Администратор');

  useEffect(() => {
    if (session) navigate('/', { replace: true });
  }, [navigate, session]);

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSession({ name: name.trim() || role, role });
    navigate('/', { replace: true });
  }

  return (
    <main className="loginPage">
      <section className="loginPanel">
        <div className="loginBrand">
          <span className="brandMark">M</span>
          <div>
            <strong>Molecula CRM</strong>
            <span>Rent in Tbilisi</span>
          </div>
        </div>
        <div className="loginCopy">
          <p className="eyebrow">Локальный вход</p>
          <h1>Рабочее пространство команды Molecula</h1>
          <p>Объекты, сделки, агенты и клиенты в одном аккуратном интерфейсе.</p>
        </div>
        <form className="loginForm" onSubmit={login}>
          <label>
            Имя
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Роль
            <select value={role} onChange={(event) => setRole(event.target.value as AuthRole)}>
              {authRoles.map((authRole) => (
                <option key={authRole}>{authRole}</option>
              ))}
            </select>
          </label>
          <button className="primaryButton fullWidth" type="submit">
            <KeyRound size={18} />
            Войти в CRM
          </button>
        </form>
        <button
          className="ghostButton fullWidth"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          type="button"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
        </button>
      </section>
    </main>
  );
}

function ProtectedLayout() {
  const { session, setSession, setTheme, theme } = useCrm();
  const navigate = useNavigate();

  if (!session) return <Navigate to="/login" replace />;

  function logout() {
    setSession(null);
    navigate('/login', { replace: true });
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <span className="brandMark">M</span>
          <div>
            <strong>Molecula CRM</strong>
            <span>Rent in Tbilisi</span>
          </div>
        </Link>

        <nav className="navigation" aria-label="Основные разделы">
          <NavItem icon={BarChart3} label="Dashboard" to="/" />
          <NavItem icon={Building2} label="Объекты" to="/properties" />
          <NavItem icon={Handshake} label="Сделки" to="/deals" />
          <NavItem icon={UsersRound} label="Агенты" to="/agents" />
          <NavItem icon={Home} label="Собственники" to="/owners" />
          <NavItem icon={UserRound} label="Клиенты" to="/clients" />
        </nav>

        <div className="sidebarFooter">
          <div className="profileBox">
            <span className="avatar">{initials(session.name)}</span>
            <div>
              <strong>{session.name}</strong>
              <span>{session.role}</span>
            </div>
          </div>
          <div className="sidebarActions">
            <button className="iconButton" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} type="button">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="iconButton" onClick={logout} type="button">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, to }: { icon: typeof Building2; label: string; to: string }) {
  return (
    <NavLink className={({ isActive }) => (isActive ? 'navButton active' : 'navButton')} end={to === '/'} to={to}>
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

function PageFrame({ children }: { children: ReactNode }) {
  const { session } = useCrm();
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <div className="pageFrame">
      <header className="topbar">
        <div>
          <p className="eyebrow">Molecula / Rent in Tbilisi</p>
          <h1>{title}</h1>
        </div>
        <div className="topbarMeta">
          <ShieldCheck size={18} />
          <span>{session?.role}</span>
        </div>
      </header>
      {children}
    </div>
  );
}

function getPageTitle(pathname: string) {
  if (pathname.startsWith('/properties/new')) return 'Новый объект';
  if (pathname.startsWith('/properties') && pathname.endsWith('/edit')) return 'Редактирование объекта';
  if (pathname.startsWith('/properties/')) return 'Карточка объекта';
  if (pathname.startsWith('/properties')) return 'Объекты';
  if (pathname.startsWith('/agents/')) return 'Карточка агента';
  if (pathname.startsWith('/agents')) return 'Агенты';
  if (pathname.startsWith('/deals')) return 'Сделки';
  if (pathname.startsWith('/owners')) return 'Собственники';
  if (pathname.startsWith('/clients')) return 'Клиенты';
  return 'Dashboard';
}

function DashboardPage() {
  return (
    <PageFrame>
      <DashboardContent />
    </PageFrame>
  );
}

function DashboardContent() {
  const { agents, properties } = useCrm();
  const stats = getPropertyStats(properties);
  const activeAgents = agents.filter((agent) => agent.isActive).length;
  const recentDeals = properties
    .filter((property) => property.status === 'Сдан' || property.status === 'Продан')
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 5);

  const dashboardCards = [
    { label: 'Объекты', value: properties.length, icon: Building2, to: '/properties' },
    { label: 'Сделки', value: getDealCount(properties), icon: Handshake, to: '/deals' },
    { label: 'Агенты', value: activeAgents, icon: UsersRound, to: '/agents' },
    { label: 'Собственники', value: new Set(properties.map((property) => property.owner).filter(Boolean)).size, icon: Home, to: '/owners' },
    { label: 'Клиенты', value: stats.inWork + stats.rented + stats.sold, icon: UserRound, to: '/clients' },
  ];

  return (
    <div className="dashboardGrid">
      <section className="dashboardMain">
        <div className="heroPanel">
          <div>
            <p className="eyebrow">Операционный центр</p>
            <h2>Molecula CRM</h2>
            <p>Фокус на объектах, сделках и команде без лишнего шума.</p>
          </div>
          <Link className="primaryButton" to="/properties/new">
            <Plus size={18} />
            Добавить объект
          </Link>
        </div>

        <div className="kpiGrid">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link className="kpiCard" key={card.label} to={card.to}>
                <span className="kpiIcon">
                  <Icon size={19} />
                </span>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </Link>
            );
          })}
        </div>

        <PropertyStats properties={properties} />

        <section className="workspace compact">
          <div className="sectionHeader">
            <div>
              <h2>Объекты в работе</h2>
              <p>Быстрый список для ежедневного контроля показов.</p>
            </div>
            <Link className="secondaryButton" to="/properties">
              Все объекты
            </Link>
          </div>
          <div className="propertyCards">
            {properties
              .filter((property) => property.status === 'В работе' || property.status === 'Новый')
              .slice(0, 4)
              .map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
          </div>
        </section>
      </section>

      <aside className="rightRail">
        <section className="workspace compact">
          <div className="sectionHeader">
            <div>
              <h2>Последние сделки</h2>
              <p>Сданные и проданные объекты.</p>
            </div>
          </div>
          <div className="dealList">
            {recentDeals.map((property) => (
              <Link className="dealItem" key={property.id} to={`/properties/${property.id}`}>
                <span className={statusClassName(property.status)}>{property.status}</span>
                <strong>{property.address}</strong>
                <small>
                  {property.agent || 'Без агента'} · {property.price}
                </small>
              </Link>
            ))}
            {recentDeals.length === 0 && <p className="emptyText">Сделок пока нет.</p>}
          </div>
        </section>
      </aside>
    </div>
  );
}

function PropertyStats({ properties }: { properties: Property[] }) {
  const stats = getPropertyStats(properties);
  const items = [
    { label: 'Всего объектов', value: stats.total },
    { label: 'В работе', value: stats.inWork },
    { label: 'Сдано', value: stats.rented },
    { label: 'Продано', value: stats.sold },
    { label: 'Архив', value: stats.archived },
  ];

  return (
    <section className="metrics" aria-label="Статистика объектов">
      {items.map((item) => (
        <article key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </article>
      ))}
    </section>
  );
}

function PropertiesPage() {
  const { properties, deleteProperty } = useCrm();
  const [addressQuery, setAddressQuery] = useState('');
  const [district, setDistrict] = useState('Все районы');
  const [dealType, setDealType] = useState('Все типы');
  const [status, setStatus] = useState('Все статусы');

  const districts = useMemo(() => getDistricts(properties), [properties]);
  const filteredProperties = useMemo(() => {
    const normalizedAddress = addressQuery.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesAddress = property.address.toLowerCase().includes(normalizedAddress);
      const matchesDistrict = district === 'Все районы' || property.district === district;
      const matchesDealType = dealType === 'Все типы' || property.dealType === dealType;
      const matchesStatus = status === 'Все статусы' || property.status === status;
      return matchesAddress && matchesDistrict && matchesDealType && matchesStatus;
    });
  }, [addressQuery, dealType, district, properties, status]);

  function removeProperty(property: Property) {
    if (window.confirm(`Удалить объект "${property.address}"?`)) {
      deleteProperty(property.id);
    }
  }

  return (
    <PageFrame>
      <PropertyStats properties={properties} />

      <section className="workspace">
        <div className="sectionHeader">
          <div>
            <h2>Объекты</h2>
            <p>Фильтры, карточки и таблица для работы агента.</p>
          </div>
          <Link className="primaryButton" to="/properties/new">
            <Plus size={18} />
            Добавить объект
          </Link>
        </div>

        <div className="filtersPanel">
          <label className="searchBox">
            <Search size={18} />
            <input
              aria-label="Поиск по адресу"
              onChange={(event) => setAddressQuery(event.target.value)}
              placeholder="Поиск по адресу"
              value={addressQuery}
            />
          </label>
          <label>
            Район
            <select value={district} onChange={(event) => setDistrict(event.target.value)}>
              <option>Все районы</option>
              {districts.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Тип сделки
            <select value={dealType} onChange={(event) => setDealType(event.target.value)}>
              <option>Все типы</option>
              {dealTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Статус
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>Все статусы</option>
              {propertyStatuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="propertyCards">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} onDelete={() => removeProperty(property)} />
          ))}
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Адрес</th>
                <th>Район</th>
                <th>Тип</th>
                <th>Цена</th>
                <th>Площадь</th>
                <th>Спальни</th>
                <th>Этаж</th>
                <th>Статус</th>
                <th>Агент</th>
                <th>Собственник</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => (
                <tr key={property.id}>
                  <td>
                    <Link to={`/properties/${property.id}`}>
                      <strong>{property.address}</strong>
                    </Link>
                    <span>{property.notes || 'Без заметок'}</span>
                  </td>
                  <td>{property.district}</td>
                  <td>{property.dealType}</td>
                  <td>{property.price}</td>
                  <td>{property.area || '-'}</td>
                  <td>{property.bedrooms || '-'}</td>
                  <td>{property.floor || '-'}</td>
                  <td>
                    <span className={statusClassName(property.status)}>{property.status}</span>
                  </td>
                  <td>{property.agent || '-'}</td>
                  <td>{property.owner || '-'}</td>
                  <td>
                    <div className="rowActions">
                      <Link className="iconButton" to={`/properties/${property.id}/edit`}>
                        <Pencil size={16} />
                      </Link>
                      <button className="iconButton danger" onClick={() => removeProperty(property)} type="button">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProperties.length === 0 && <p className="emptyText">По этим фильтрам объектов нет.</p>}
      </section>
    </PageFrame>
  );
}

function PropertyCard({ property, onDelete }: { property: Property; onDelete?: () => void }) {
  return (
    <article className="propertyCard">
      <div className="cardTopline">
        <span className={statusClassName(property.status)}>{property.status}</span>
        <strong>{property.price}</strong>
      </div>
      <Link className="cardTitle" to={`/properties/${property.id}`}>
        {property.address}
      </Link>
      <dl>
        <div>
          <dt>Район</dt>
          <dd>{property.district}</dd>
        </div>
        <div>
          <dt>Тип сделки</dt>
          <dd>{property.dealType}</dd>
        </div>
        <div>
          <dt>Площадь</dt>
          <dd>{property.area || '-'}</dd>
        </div>
        <div>
          <dt>Спальни</dt>
          <dd>{property.bedrooms || '-'}</dd>
        </div>
        <div>
          <dt>Этаж</dt>
          <dd>{property.floor || '-'}</dd>
        </div>
        <div>
          <dt>Агент</dt>
          <dd>{property.agent || '-'}</dd>
        </div>
        <div>
          <dt>Собственник</dt>
          <dd>{property.owner || '-'}</dd>
        </div>
        <div>
          <dt>Фото</dt>
          <dd>
            {property.photoUrl ? (
              <a href={property.photoUrl} target="_blank" rel="noreferrer">
                Открыть
              </a>
            ) : (
              '-'
            )}
          </dd>
        </div>
      </dl>
      <p>{property.notes || 'Заметки пока не добавлены.'}</p>
      <div className="cardActions">
        <Link className="secondaryButton" to={`/properties/${property.id}`}>
          Открыть
        </Link>
        <Link className="ghostButton" to={`/properties/${property.id}/edit`}>
          <Pencil size={16} />
          Редактировать
        </Link>
        {onDelete && (
          <button className="ghostButton dangerText" onClick={onDelete} type="button">
            <Trash2 size={16} />
            Удалить
          </button>
        )}
      </div>
    </article>
  );
}

function PropertyDetailPage() {
  const { deleteProperty, properties } = useCrm();
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const property = properties.find((item) => item.id === propertyId);

  if (!property) {
    return (
      <PageFrame>
        <NotFoundPanel title="Объект не найден" backTo="/properties" />
      </PageFrame>
    );
  }

  function removeProperty() {
    if (!property) return;
    if (window.confirm(`Удалить объект "${property.address}"?`)) {
      deleteProperty(property.id);
      navigate('/properties');
    }
  }

  return (
    <PageFrame>
      <section className="detailLayout">
        <div className="workspace">
          <Link className="backLink" to="/properties">
            <ArrowLeft size={16} />
            Объекты
          </Link>
          <div className="detailHeader">
            <div>
              <span className={statusClassName(property.status)}>{property.status}</span>
              <h2>{property.address}</h2>
              <p>{property.notes || 'Заметки пока не добавлены.'}</p>
            </div>
            <strong className="detailPrice">{property.price}</strong>
          </div>
          <div className="detailGrid">
            <InfoItem label="Район" value={property.district} />
            <InfoItem label="Тип сделки" value={property.dealType} />
            <InfoItem label="Площадь" value={property.area || '-'} />
            <InfoItem label="Спальни" value={property.bedrooms || '-'} />
            <InfoItem label="Этаж" value={property.floor || '-'} />
            <InfoItem label="Агент" value={property.agent || '-'} />
            <InfoItem label="Собственник" value={property.owner || '-'} />
            <InfoItem
              label="Фото"
              value={
                property.photoUrl ? (
                  <a href={property.photoUrl} target="_blank" rel="noreferrer">
                    Открыть ссылку
                  </a>
                ) : (
                  '-'
                )
              }
            />
          </div>
        </div>

        <aside className="workspace compact">
          <h2>Действия</h2>
          <div className="stackedActions">
            <Link className="primaryButton fullWidth" to={`/properties/${property.id}/edit`}>
              <Pencil size={18} />
              Редактировать
            </Link>
            <button className="secondaryButton fullWidth dangerText" onClick={removeProperty} type="button">
              <Trash2 size={18} />
              Удалить объект
            </button>
          </div>
        </aside>
      </section>
    </PageFrame>
  );
}

function PropertyFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { properties, upsertProperty } = useCrm();
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const existingProperty = properties.find((property) => property.id === propertyId);
  const [form, setForm] = useState<PropertyFormState>(
    mode === 'edit' && existingProperty
      ? {
          address: existingProperty.address,
          district: existingProperty.district,
          dealType: existingProperty.dealType,
          price: existingProperty.price,
          area: existingProperty.area,
          bedrooms: existingProperty.bedrooms,
          floor: existingProperty.floor,
          status: existingProperty.status,
          agent: existingProperty.agent,
          owner: existingProperty.owner,
          photoUrl: existingProperty.photoUrl,
          notes: existingProperty.notes,
        }
      : emptyProperty,
  );

  if (mode === 'edit' && !existingProperty) {
    return (
      <PageFrame>
        <NotFoundPanel title="Объект не найден" backTo="/properties" />
      </PageFrame>
    );
  }

  function updateField<Field extends keyof PropertyFormState>(field: Field, value: PropertyFormState[Field]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function saveProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const property: Property = {
      ...form,
      id: existingProperty?.id || crypto.randomUUID(),
      createdAt: existingProperty?.createdAt || new Date().toISOString(),
      address: form.address.trim(),
      district: form.district.trim(),
      price: form.price.trim(),
      area: form.area.trim(),
      bedrooms: form.bedrooms.trim(),
      floor: form.floor.trim(),
      agent: form.agent.trim(),
      owner: form.owner.trim(),
      photoUrl: form.photoUrl.trim(),
      notes: form.notes.trim(),
    };

    upsertProperty(property);
    navigate(`/properties/${property.id}`);
  }

  return (
    <PageFrame>
      <form className="workspace propertyForm" onSubmit={saveProperty}>
        <div className="sectionHeader">
          <div>
            <h2>{mode === 'create' ? 'Новый объект' : 'Редактирование объекта'}</h2>
            <p>Заполните карточку так, чтобы агент мог быстро принять объект в работу.</p>
          </div>
          <Link className="secondaryButton" to={existingProperty ? `/properties/${existingProperty.id}` : '/properties'}>
            Отмена
          </Link>
        </div>
        <div className="formGrid">
          <label>
            Адрес
            <input required value={form.address} onChange={(event) => updateField('address', event.target.value)} />
          </label>
          <label>
            Район
            <input required value={form.district} onChange={(event) => updateField('district', event.target.value)} />
          </label>
          <label>
            Тип сделки
            <select value={form.dealType} onChange={(event) => updateField('dealType', event.target.value as DealType)}>
              {dealTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Цена
            <input required value={form.price} onChange={(event) => updateField('price', event.target.value)} />
          </label>
          <label>
            Площадь
            <input value={form.area} onChange={(event) => updateField('area', event.target.value)} />
          </label>
          <label>
            Спальни
            <input value={form.bedrooms} onChange={(event) => updateField('bedrooms', event.target.value)} />
          </label>
          <label>
            Этаж
            <input value={form.floor} onChange={(event) => updateField('floor', event.target.value)} />
          </label>
          <label>
            Статус
            <select value={form.status} onChange={(event) => updateField('status', event.target.value as PropertyStatus)}>
              {propertyStatuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Агент
            <input value={form.agent} onChange={(event) => updateField('agent', event.target.value)} />
          </label>
          <label>
            Собственник
            <input value={form.owner} onChange={(event) => updateField('owner', event.target.value)} />
          </label>
          <label className="wideField">
            Ссылка на фото
            <input type="url" value={form.photoUrl} onChange={(event) => updateField('photoUrl', event.target.value)} />
          </label>
          <label className="wideField">
            Заметки
            <textarea rows={4} value={form.notes} onChange={(event) => updateField('notes', event.target.value)} />
          </label>
        </div>
        <div className="formActions">
          <button className="primaryButton" type="submit">
            Сохранить объект
          </button>
        </div>
      </form>
    </PageFrame>
  );
}

function AgentsPage() {
  const { agents } = useCrm();
  const activeAgents = agents.filter((agent) => agent.isActive).length;
  const totalDeals = agents.reduce((sum, agent) => sum + agent.dealsCount, 0);
  const totalExclusives = agents.reduce((sum, agent) => sum + agent.exclusiveCount, 0);

  return (
    <PageFrame>
      <section className="metrics" aria-label="Статистика команды">
        <article>
          <span>Всего в команде</span>
          <strong>{agents.length}</strong>
        </article>
        <article>
          <span>Активны</span>
          <strong>{activeAgents}</strong>
        </article>
        <article>
          <span>Сделок</span>
          <strong>{totalDeals}</strong>
        </article>
        <article>
          <span>Эксклюзивов</span>
          <strong>{totalExclusives}</strong>
        </article>
      </section>

      <section className="workspace">
        <div className="sectionHeader">
          <div>
            <h2>Команда Molecula</h2>
            <p>Роли, активность, сделки и эксклюзивы агентской команды.</p>
          </div>
        </div>
        <div className="agentGrid">
          {agents.map((agent) => (
            <AgentCard agent={agent} key={agent.id} />
          ))}
        </div>
      </section>
    </PageFrame>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link className="agentCard" to={`/agents/${agent.id}`}>
      <div className="agentHeader">
        <span className="avatar large">{initials(agent.name)}</span>
        <div>
          <strong>{agent.name}</strong>
          <span>{agent.role}</span>
        </div>
        <span className={agent.isActive ? 'agentState active' : 'agentState'}>{agent.isActive ? 'Активен' : 'Неактивен'}</span>
      </div>
      <div className="agentStats">
        <InfoItem label="Telegram" value={agent.telegram} />
        <InfoItem label="Телефон" value={agent.phone} />
        <InfoItem label="Сделок" value={String(agent.dealsCount)} />
        <InfoItem label="Эксклюзивов" value={String(agent.exclusiveCount)} />
        <InfoItem label="Комиссия" value={`${agent.commissionPercent}%`} />
      </div>
    </Link>
  );
}

function AgentDetailPage() {
  const { agents } = useCrm();
  const { agentId } = useParams();
  const agent = agents.find((item) => item.id === agentId);

  if (!agent) {
    return (
      <PageFrame>
        <NotFoundPanel title="Агент не найден" backTo="/agents" />
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <section className="detailLayout">
        <div className="workspace">
          <Link className="backLink" to="/agents">
            <ArrowLeft size={16} />
            Агенты
          </Link>
          <div className="agentProfile">
            <span className="avatar xlarge">{initials(agent.name)}</span>
            <div>
              <span className={agent.isActive ? 'agentState active' : 'agentState'}>
                {agent.isActive ? 'Активен' : 'Неактивен'}
              </span>
              <h2>{agent.name}</h2>
              <p>{agent.role}</p>
            </div>
          </div>
          <div className="detailGrid">
            <InfoItem label="Telegram" value={agent.telegram} />
            <InfoItem label="Телефон" value={agent.phone} />
            <InfoItem label="Роль" value={agent.role} />
            <InfoItem label="Количество сделок" value={String(agent.dealsCount)} />
            <InfoItem label="Количество эксклюзивов" value={String(agent.exclusiveCount)} />
            <InfoItem label="Процент комиссии" value={`${agent.commissionPercent}%`} />
          </div>
        </div>
        <aside className="workspace compact">
          <h2>Роли команды</h2>
          <div className="roleList">
            {teamRoles.map((role) => (
              <span key={role}>{role}</span>
            ))}
          </div>
        </aside>
      </section>
    </PageFrame>
  );
}

function SimpleSectionPage({ icon: Icon, title }: { icon: typeof Building2; title: string }) {
  return (
    <PageFrame>
      <section className="workspace emptySection">
        <span className="emptyIcon">
          <Icon size={24} />
        </span>
        <h2>{title}</h2>
        <p>Раздел готов к подключению следующих сущностей CRM.</p>
      </section>
    </PageFrame>
  );
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="infoItem">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function NotFoundPanel({ backTo, title }: { backTo: string; title: string }) {
  return (
    <section className="workspace emptySection">
      <span className="emptyIcon">
        <UserCheck size={24} />
      </span>
      <h2>{title}</h2>
      <Link className="secondaryButton" to={backTo}>
        Вернуться
      </Link>
    </section>
  );
}
