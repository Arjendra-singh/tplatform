# Local Setup

## Prerequisites

- Node.js 20+
- npm 10+
- Optional: PostgreSQL 14+

## Environment

```bash
cp .env.example .env
```

Set `REPOSITORY_ADAPTER=memory` for default local mode.

Use Postgres mode:

- set `REPOSITORY_ADAPTER=postgres`
- set `DATABASE_URL`
- run migration:

```bash
psql "$DATABASE_URL" -f apps/api/migrations/001_init.sql
```

## Run

```bash
npm install
npm run start:api
npm test
```
