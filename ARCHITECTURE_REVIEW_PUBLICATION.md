# Архитектурное ревью taxonomy и публикаций

## Что проверено

### Taxonomy

- Все официальные справочники собраны в `src/domain/taxonomy.ts`.
- Каждый элемент содержит `id`, `labelRu`, `labelEn`, `hashtag`, `category`, `dealTypes`, `active` и `sortOrder`.
- Одинаковые элементы аренды и продажи объединяются по паре `category + hashtag`; итоговый массив не содержит дублей.
- Фильтрация по `dealType` и стабильность `sortOrder` покрыты unit tests.
- Компоненты получают варианты через `getTaxonomyItems()` и не содержат списков официальных хэштегов.
- Категории `GroundFloor`, `MiddleFloor` и `TopFloor` отсутствуют.

### Генерация

- Единственный публичный export текстового генератора — `buildPublicationText(property)` из `src/services/buildPublicationText.ts`.
- Rent/sale templates и builders разделены, но остаются приватными деталями реализации.
- React preview вызывает только `buildPublicationText()` и не форматирует текст самостоятельно.
- Стандартный блок агента определён один раз и всегда использует `@David_Tibelashvili` и `+995 599 20 67 16`.
- Официальные хэштеги генератор получает по taxonomy ID; текстовые списки хэштегов вне taxonomy удалены.
- Точные rent/sale блоки, переносы, границы цен и отсутствующие значения покрыты тестами.

### Модель и repository

- В `Property` хранятся taxonomy ID для района, метро, типа, спален, здания, дизайна, состояния, удобств, питомцев и периодов.
- Для агента хранятся только `agentId` и `agentHashtag`; Telegram username и телефон отсутствуют в модели.
- Repository использует schema version 4 и мигрирует ключи v1, v2 и v3.
- Старые hashtags преобразуются в taxonomy ID; неизвестные справочные значения сохраняются в `legacyMetadata`.
- Повторное чтение v4 не запускает миграцию заново; идемпотентность проверена тестом.

### Качество и границы изменений

- Строгая компиляция дополнительно запущена с `--noUnusedLocals --noUnusedParameters`.
- `any`, подавления TypeScript и дублирующая реализация генератора отсутствуют.
- Секреты, токены, `chat_id`, API-ключи и bot tokens во frontend не найдены.
- Фиксированные Telegram username и телефон являются публичным шаблонным контактом, а не секретом.
- Backend, общий layout и другие бизнес-модули не изменялись.

## Что исправлено во время ревью

- Удалён лишний re-export `src/services/publicationText.ts`.
- Внутренние rent/sale template-функции перестали быть публичными exports.
- Deal hashtags и price-range hashtags переведены на единый taxonomy-источник.
- Сравнения удобств в генераторе переведены с hashtag-строк на taxonomy ID.
- Удалены устаревшие свободные поля `priceRange`, `salePriceRange` и `rentalTerm`.
- Исправлен порядок sale bedrooms: `Studio` располагается перед числовыми вариантами.
- `Apartment` добавлен для sale в соответствии с эталонным постом.
- `Elevator` доступен для sale в соответствии с эталонным постом, оставаясь одним taxonomy-элементом.
- Удалён неиспользуемый `useNavigate`.
- Тест миграции усилен проверкой идемпотентности и сохранения неизвестного значения.

## Оставшиеся риски

- Справочник агентов пока не подключён, поэтому `agentHashtag` является динамическим полем агента, а не элементом официальной property taxonomy. При реализации модуля агентов его следует выбирать по `agentId`.
- Локальные media preview хранятся как Data URL и ограничены квотой `localStorage`; repository возвращает понятную ошибку при переполнении.
- Миграция сохраняет неизвестные справочные значения, но не пытается автоматически угадать их смысл.
- Vite выводит предупреждение о deprecated CJS Node API; оно не влияет на build и связано с текущей версией конфигурации Vite.

## Итоговый список изменённых файлов

- `ARCHITECTURE_REVIEW_PUBLICATION.md`
- `package.json`
- `package-lock.json`
- `src/domain/property.ts`
- `src/domain/taxonomy.ts`
- `src/repositories/propertyRepository.ts`
- `src/repositories/propertyRepository.test.ts`
- `src/services/propertyService.ts`
- `src/services/publicationTaxonomy.ts`
- `src/services/publicationTaxonomy.test.ts`
- `src/services/buildPublicationText.ts`
- `src/services/buildPublicationText.test.ts`
- `src/modules/properties/PropertiesPage.tsx`
- `src/modules/properties/PropertyDetailPage.tsx`
- `src/modules/properties/PropertyFormPage.tsx`
- `src/modules/properties/properties.css`

`src/services/publicationText.ts` удалён в рамках текущих незакоммиченных изменений и в итоговую версию не входит.
