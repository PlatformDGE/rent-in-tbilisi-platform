# Molecula Backend Target

This folder contains the backend-first target architecture for Rent in Tbilisi / Molecula.

Current state:

- `index.ts` is still a lightweight local mock for Telegram endpoints.
- `prisma/schema.prisma` defines the future PostgreSQL data model.
- `openapi/molecula-api.yaml` defines the REST API contract.

Target stack:

- Node.js
- Express
- PostgreSQL
- Prisma ORM
- JWT
- RBAC
- Swagger/OpenAPI
- structured logs
- media upload adapter
- Telegram publishing/import services
- Google Sheets import services

## Required env

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_TEST_CHANNEL_ID=...
TELEGRAM_PRODUCTION_CHANNEL_ID=@rent_in_tbilisi
MEDIA_STORAGE_DRIVER=local
```

Frontend must never store:

- Telegram Bot Token;
- Google credentials;
- database credentials;
- JWT signing secret.

## Module boundaries

Backend modules should be split by system:

- `auth`
- `workday`
- `properties`
- `owners`
- `clients`
- `leads`
- `deals`
- `commissions`
- `publications`
- `telegram`
- `media`
- `imports`
- `analytics`
- `audit`
- `settings`

Each module should own:

- DTO/schema validation;
- service business rules;
- repository access through Prisma;
- audit log writes;
- route registration;
- tests.

## Telegram import truth

Telegram Bot API cannot read old channel history or private account messages.

Supported options:

1. Telegram export file import.
2. Telegram Client API/Telethon migration tool.
3. Own Telegram bot for new messages only.
