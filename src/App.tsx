import { Building2, Handshake, Home, Plus, Search, UserRound, UsersRound } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type DealType = 'Аренда' | 'Продажа';
type PropertyStatus = 'Новый' | 'В работе' | 'Сдан' | 'Продан' | 'Архив';

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
};

const STORAGE_KEY = 'molecula-crm-properties';

const emptyProperty: Omit<Property, 'id'> = {
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
    status: 'Новый',
    agent: 'David Kapanadze',
    owner: 'Mariam Janelidze',
    photoUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3',
    notes: 'Исторический дом, высокий потолок, нужен свежий фотоотчет.',
  },
];

const navItems = [
  { label: 'Объекты', icon: Building2 },
  { label: 'Агенты', icon: UsersRound },
  { label: 'Сделки', icon: Handshake },
  { label: 'Собственники', icon: Home },
  { label: 'Клиенты', icon: UserRound },
];

function statusClassName(status: PropertyStatus) {
  return `status status-${status.toLowerCase().replace(/\s+/g, '-')}`;
}

function loadProperties() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return starterProperties;

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as Property[]) : starterProperties;
  } catch {
    return starterProperties;
  }
}

export function App() {
  const [activeSection, setActiveSection] = useState('Объекты');
  const [properties, setProperties] = useState<Property[]>(loadProperties);
  const [form, setForm] = useState(emptyProperty);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
  }, [properties]);

  const filteredProperties = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return properties;

    return properties.filter((property) =>
      [property.address, property.district, property.agent, property.owner, property.status]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    );
  }, [properties, query]);

  const totalRent = properties.filter((property) => property.dealType === 'Аренда').length;
  const activeDeals = properties.filter((property) => property.status === 'В работе').length;

  function updateField<Field extends keyof typeof form>(field: Field, value: (typeof form)[Field]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextProperty: Property = {
      ...form,
      id: crypto.randomUUID(),
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

    setProperties((current) => [nextProperty, ...current]);
    setForm(emptyProperty);
    setIsFormOpen(false);
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brandMark">M</span>
          <div>
            <strong>Molecula CRM</strong>
            <span>Rent in Tbilisi</span>
          </div>
        </div>

        <nav className="navigation" aria-label="Основные разделы">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={activeSection === item.label ? 'navButton active' : 'navButton'}
                key={item.label}
                onClick={() => setActiveSection(item.label)}
                type="button"
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">CRM для агентства недвижимости</p>
            <h1>Molecula CRM</h1>
          </div>
          <button className="primaryButton" onClick={() => setIsFormOpen((value) => !value)} type="button">
            <Plus size={18} />
            Добавить объект
          </button>
        </header>

        <section className="metrics" aria-label="Сводка">
          <article>
            <span>Всего объектов</span>
            <strong>{properties.length}</strong>
          </article>
          <article>
            <span>Аренда</span>
            <strong>{totalRent}</strong>
          </article>
          <article>
            <span>Сделки в работе</span>
            <strong>{activeDeals}</strong>
          </article>
        </section>

        {activeSection === 'Объекты' ? (
          <section className="workspace">
            <div className="sectionHeader">
              <div>
                <h2>Объекты</h2>
                <p>База квартир и домов для аренды и продажи в Тбилиси.</p>
              </div>
              <label className="searchBox">
                <Search size={18} />
                <input
                  aria-label="Поиск объектов"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Поиск"
                  value={query}
                />
              </label>
            </div>

            {isFormOpen && (
              <form className="propertyForm" onSubmit={addProperty}>
                <h3>Новый объект</h3>
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
                      <option>Аренда</option>
                      <option>Продажа</option>
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
                      <option>Новый</option>
                      <option>В работе</option>
                      <option>Сдан</option>
                      <option>Продан</option>
                      <option>Архив</option>
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
                    <textarea rows={3} value={form.notes} onChange={(event) => updateField('notes', event.target.value)} />
                  </label>
                </div>
                <div className="formActions">
                  <button className="secondaryButton" onClick={() => setIsFormOpen(false)} type="button">
                    Отмена
                  </button>
                  <button className="primaryButton" type="submit">
                    Сохранить объект
                  </button>
                </div>
              </form>
            )}

            <div className="propertyCards" aria-label="Карточки объектов">
              {filteredProperties.map((property) => (
                <article className="propertyCard" key={`card-${property.id}`}>
                  <div className="cardTopline">
                    <span className={statusClassName(property.status)}>{property.status}</span>
                    <strong>{property.price}</strong>
                  </div>
                  <h3>{property.address}</h3>
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
                </article>
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
                    <th>Фото</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map((property) => (
                    <tr key={property.id}>
                      <td>
                        <strong>{property.address}</strong>
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
                        {property.photoUrl ? (
                          <a href={property.photoUrl} target="_blank" rel="noreferrer">
                            Открыть
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="placeholder">
            <h2>{activeSection}</h2>
            <p>Раздел подготовлен для следующей итерации CRM.</p>
          </section>
        )}
      </main>
    </div>
  );
}
