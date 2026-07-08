# Molecula ERP Platform Blueprint

This project is moving from a local CRM prototype to a backend-first ERP platform for Rent in Tbilisi / Molecula.

## Architecture Direction

The product is organized around business systems, not pages.

- Identity and RBAC
- Agent workday
- Properties
- Owners
- Clients
- Leads
- Deals
- Commissions
- Publications
- Telegram
- Media
- Cities and districts
- Imports
- Audit history
- Analytics
- Settings

Frontend responsibilities:

- render workflows;
- collect user input;
- show validation and confirmations;
- call API contracts;
- keep Demo mode local only.

Backend responsibilities:

- own business rules;
- validate entity relationships;
- write action history;
- calculate commissions and analytics;
- publish to Telegram and other channels;
- import Telegram/Google Sheets data;
- store files through a media adapter;
- enforce JWT and RBAC.

## Entity Graph

Property is the operating center, but it is not isolated.

Property links to:

- Owner
- Agent
- Operator
- City
- District
- MediaAsset
- Publication
- Deal
- Lead
- Viewing
- PriceHistory
- CommissionHistory
- ActionLog

Owner links to:

- Property
- Deal
- Communication
- ActionLog

Client links to:

- Lead
- Viewing
- Deal
- Communication

Deal links to:

- Property
- Owner
- Client
- Agent
- Commission
- ActionLog

## Agent Workday

When an agent logs in, the first screen should answer: what do I do now?

Workday blocks:

- New leads
- Calls due today
- Properties needing update
- Properties without enough photo/video
- Publications due today
- Scheduled viewings
- Contracts waiting for signature
- Unpaid or unfinished deals
- Progress to next level: 50% -> 70% -> 90%
- KPI today, week, month

This is a product layer, not a page. In production it should come from `GET /api/workday/me`.

## Telegram Import

Do not promise impossible access.

Telegram Bot API cannot:

- read personal account messages;
- read historical messages from an existing channel unless the bot receives them;
- parse the working account chat history.

Supported import paths:

1. Telegram export import
   - User exports channel/chat history manually from Telegram Desktop.
   - Backend parses JSON/HTML export.
   - Best for historical migration.

2. Telegram Client API import
   - Uses Telethon or another MTProto client.
   - Requires separate operational and legal handling.
   - Best for controlled internal migration tools.

3. Own Telegram bot
   - Bot receives new leads/messages from the moment it is connected.
   - Cannot read old history.
   - Best for ongoing automation.

## Google Sheets Import

Google Sheets is its own system:

- import properties;
- import clients;
- import owners;
- import deals;
- map columns;
- preview changes;
- create ImportJob;
- write errors and history.

Credentials must live in backend env/secrets, never in frontend.

## Media Service

Media is not a field on Property. It is a service.

Supported kinds:

- photo;
- video;
- documents;
- floor plans;
- PDF;
- 3D;
- YouTube.

The adapter must support migration to:

- S3;
- Cloudflare R2;
- Supabase Storage;
- local dev storage.

## Audit History

Every write action must produce `ActionLog`:

- actor;
- entity type;
- entity id;
- action;
- old value;
- new value;
- timestamp.

This is required for properties, owners, clients, leads, deals, publications and settings.

## Migration Phases

1. Modular frontend domain extraction
   - Current completed direction: move types, constants, analytics, Telegram, importers and demo repository out of `App.tsx`.

2. API contract and Prisma schema
   - Current completed direction: add `server/prisma/schema.prisma` and OpenAPI contract.

3. Express backend
   - Add Express, Prisma, JWT, RBAC, Swagger.
   - Replace local demo repository with API client.

4. Entity screens
   - Split pages by modules.
   - Owner card, client card, lead pipeline, deal card, property center.

5. Automation
   - Deal creation updates property status, agent stats, owner stats and analytics.
   - Publication writes channel history.
   - Imports write ImportJob and ActionLog.

6. BI dashboard
   - Revenue, conversion funnel, district heat map, price dynamics, top agents, top objects.
