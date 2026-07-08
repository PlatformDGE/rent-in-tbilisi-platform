# Molecula ERP / Rent in Tbilisi

Локальный прототип постепенно перестраивается в ERP-платформу агентства недвижимости Rent in Tbilisi / Molecula.

Цель системы: не просто хранить объекты, а управлять полным циклом агентства:

`собственник -> объект -> медиа -> публикация -> лид -> клиент -> просмотр -> сделка -> комиссия -> аналитика -> история`.

## Запуск

```bash
npm install
npm run dev
```

Локальный адрес:

```bash
http://127.0.0.1:5173/
```

Сборка:

```bash
npm run build
```

## Что добавлено

- Первый архитектурный refactor: доменная логика вынесена из `App.tsx` в `src/domain`
- Backend-first scaffold: Prisma schema, OpenAPI contract, backend README
- Новый блок `Рабочий день агента` на Dashboard
- Локальный вход без сервера
- Dashboard с операционными показателями
- Премиальный Molecula header и левое меню
- Полная карточка объекта для аренды/продажи
- Фильтры по району, типу сделки, статусу и поиск по адресу
- Загрузка нескольких фото в `localStorage` как base64
- Добавление фото ссылками
- Галерея объекта, выбор главного фото и порядок первых 9 фото для Telegram album
- Видео-ссылка и metadata видео-файла без сохранения тяжелого файла в `localStorage`
- Цветные статусы объектов
- Уведомления после сохранения и копирования
- Подтверждение удаления объекта
- Архивирование объекта и возврат из архива
- Предпросмотр Telegram-поста в виде телефона
- Кнопка `Скопировано` после копирования
- История публикаций в `localStorage`
- Строгий Telegram-шаблон Rent in Tbilisi с whitelisted hashtags
- Страницы `Аналитика`, `Районы и цены`, `Публикации`
- Статистика за неделю, месяц и по агентам
- Click-through Dashboard: KPI открывают список объектов, агентов, сделок или публикаций
- Карточка агента с объектами, сделками, комиссией и публикациями
- Импорт объекта из Telegram-поста Rent in Tbilisi
- CSV import для базовых колонок из Google Sheets / старой базы
- Страница Telegram Demo/Test/Production workflow
- Страница настроек бренда
- Светлая и темная тема

## Архитектура

Текущая структура:

```text
src/App.tsx                    UI, routing, page composition
src/domain/types.ts            основные сущности
src/domain/constants.ts        справочники и demo defaults
src/domain/demoData.ts         demo seed data
src/domain/demoRepository.ts   localStorage adapter для Demo режима
src/domain/normalizers.ts      нормализация входных данных
src/domain/analytics.ts        KPI, районная и агентская аналитика
src/domain/telegram.ts         Telegram post engine
src/domain/importers.ts        Telegram/CSV parser
src/domain/agentWorkday.ts     персональные задачи агента
server/prisma/schema.prisma    будущая PostgreSQL модель
server/openapi/molecula-api.yaml REST API контракт
docs/architecture/platform-blueprint.md ERP blueprint
```

Правило развития:

- frontend показывает workflows;
- backend должен владеть бизнес-логикой;
- `localStorage` остается только Demo режимом;
- реальные Telegram token, Google credentials, JWT secret и database credentials не должны попадать во frontend.

## Как пользоваться

1. Войдите через экран входа как `Администратор`, `Оператор` или `Агент`.
2. Откройте `Добавить объект`.
3. Заполните параметры объекта, контакты собственника и внутренние заметки.
4. Загрузите фото с компьютера или добавьте фото ссылками.
5. Выберите главное фото.
6. Расставьте порядок фото стрелками. В Telegram попадут первые 9 фото.
7. Добавьте видео-ссылку или metadata видео-файла, если нужно.
8. Сохраните объект.
9. Откройте `Предпросмотр поста`.
10. Выберите объект, язык и тип шаблона.
11. Скопируйте пост, хэштеги, сохраните его в историю или отправьте тестовую публикацию.

## Telegram

CRM генерирует посты в формате Rent in Tbilisi:

```text
#Saburtalo 🚇 #MCUniversity
📍14b Shalva Nutsubidze Street

❗️#Exclusive

🏢 #2Bed #Apartment for #Rent
✨ #NewBuilding | #White
🏠105 sq.m | 5/12 Floor |
#CentralHeating | #Shower
```

Доступные режимы:

- `Demo`: подготовка, копирование и ручная публикация
- `Test`: попытка отправки в `POST /api/telegram/publish-test`
- `Production`: подтверждение и попытка отправки в `POST /api/telegram/publish-production`

История публикаций хранит:

- объект
- дату
- автора
- канал
- статус
- текст поста
- количество фото
- ошибку или ссылку на сообщение, если backend вернул ее

Важно: `TELEGRAM_BOT_TOKEN` нельзя хранить во фронтенде. Production-отправку нужно подключать через backend.

## Backend example

В проекте есть пример `server/index.ts` с маршрутами:

- `POST /api/telegram/publish-test`
- `POST /api/telegram/publish-production`
- `POST /api/media/upload`

Пример backend не хранит Telegram token во фронтенде. Для реальной публикации token должен быть в `.env` backend:

```bash
TELEGRAM_BOT_TOKEN=...
```

Целевая backend-архитектура описана в:

- `server/prisma/schema.prisma`
- `server/openapi/molecula-api.yaml`
- `server/README.md`
- `docs/architecture/platform-blueprint.md`

## Import

Страница `Импорт` умеет:

- распарсить Telegram-пост в формате Rent in Tbilisi;
- создать объект из whitelisted hashtags без случайных тегов;
- импортировать CSV с колонками `address,district,metro,deal_type,price,area,bedrooms,floor,total_floors,status,agent,owner,phone,telegram,photo_url`.

Ограничения локального режима:

- frontend не может читать старую историю Telegram-канала;
- frontend не может читать личные сообщения Telegram;
- Google Sheets credentials нельзя хранить во frontend;
- большие видео-файлы должны уходить в backend storage, не в `localStorage`.

## Telegram import truth

Через Telegram Bot API нельзя:

- читать личные сообщения рабочего аккаунта;
- читать историю существующего канала;
- парсить старую переписку аккаунта.

Архитектура предусматривает три честных варианта:

1. Telegram export import: ручной экспорт из Telegram Desktop, затем backend parser.
2. Telegram Client API / Telethon: отдельный migration tool с доступом через MTProto.
3. Собственный Telegram bot: принимает только новые обращения после подключения.

## Следующие этапы

1. Разбить UI-страницы по `src/modules/*`.
2. Подключить Express + Prisma + PostgreSQL.
3. Перевести `demoRepository` на API client.
4. Добавить Owner, Client, Lead, Deal cards как отдельные сущности.
5. Добавить ActionLog на каждое изменение.
6. Сделать BI Dashboard вместо таблиц.
