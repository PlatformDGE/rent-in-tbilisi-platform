# Развёртывание Rent in Tbilisi Platform

## Переменные сборки

- `VITE_PUBLIC_BASE_URL` — базовый путь приложения. Для текущего GitHub Pages: `/rent-in-tbilisi-platform/`. Для корневого собственного домена: `/`.
- `VITE_TELEGRAM_ASSET_BASE_URL` — абсолютный HTTPS URL каталога, относительно которого доступны пути `telegram-images/...` из рейтинга.

Внешние ссылки `https://t.me/...` берутся непосредственно из JSON и не зависят от базового пути приложения.

## Вариант A: собственный домен через GitHub Pages

1. Откройте в GitHub `Settings → Pages` репозитория.
2. Убедитесь, что Source настроен на GitHub Actions и workflow deployment проходит.
3. Укажите домен в поле `Custom domain`.
4. Добавьте файл `public/CNAME`, содержащий только доменное имя, либо позвольте GitHub создать его через Settings.
5. У DNS-провайдера создайте `CNAME` для поддомена на `platformdge.github.io`. Для apex-домена используйте актуальные A/AAAA-записи GitHub Pages из официальной документации GitHub.
6. Дождитесь проверки DNS и выпуска сертификата, затем включите `Enforce HTTPS`.
7. Для сборки на корневом домене задайте repository variable `VITE_PUBLIC_BASE_URL=/`. Для project Pages оставьте `/rent-in-tbilisi-platform/`.
8. Задайте `VITE_TELEGRAM_ASSET_BASE_URL` на публичный каталог Telegram-фотографий.
9. После deployment откройте напрямую `/properties`, `/map` и `/profile`, затем обновите страницу. Workflow создаёт entry points известных маршрутов и `404.html` для SPA fallback.

## Вариант B: отдельный хостинг

1. Установите Node.js 22.
2. Задайте переменные окружения сборки:

   ```bash
   VITE_PUBLIC_BASE_URL=/
   VITE_TELEGRAM_ASSET_BASE_URL=https://assets.example.com/
   ```

3. Выполните `npm ci` и `npm run build`.
4. Опубликуйте содержимое `dist`, а не сам каталог.
5. Настройте rewrite всех неизвестных маршрутов на `/index.html` с HTTP 200.
6. Оставьте Telegram workflow включённым в репозитории-источнике данных. Он должен регулярно создавать `telegram-top10.json` и `telegram-images/`.
7. Доставляйте JSON на production атомарно: сначала новый файл, затем заменяйте текущий. Ответ должен запрещать длительное кеширование или поддерживать network-first.
8. Синхронизируйте каталог `telegram-images` с путями, записанными в JSON.
9. Для Telegram workflow нужны секреты `TELEGRAM_API_ID`, `TELEGRAM_API_HASH` и `TELEGRAM_SESSION`. Их нельзя передавать во frontend или добавлять в Vite variables.
10. При смене источника JSON измените deployment-этап доставки `dist/telegram-top10.json`; компонент всегда читает `${import.meta.env.BASE_URL}telegram-top10.json`.

## Проверка после переноса

- JSON и фотографии отвечают по HTTPS.
- Прямые Telegram-ссылки остаются абсолютными `https://t.me/rent_tbilisi_ge/{message_id}`.
- Refresh внутренних маршрутов не возвращает страницу хостинга 404.
- В Console и Network отсутствуют ошибки.
- Карта показывает только элементы рейтинга с подтверждёнными координатами.
