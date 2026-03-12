# Tender Sahayak Platform

Backend milestone now includes RBAC, repository abstraction (memory + Postgres adapter), secure refresh-token lifecycle, auth rate-limiting, and audit logging.

## Implemented backend endpoints

- `GET /health`
- `GET /api/v1/meta`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh` (JSON body or cookie refresh token)
- `GET /api/v1/organizations` (owner/admin)
- `GET /api/v1/organizations/:orgId/members` (owner/admin)
- `GET /api/v1/tenders`
- `GET /api/v1/tenders/:id`
- `POST /api/v1/tenders/:id/bookmark`
- `GET /api/v1/tenders/bookmarks`

## API compatibility

- Canonical pagination response is `data + meta`.
- Legacy compatibility fields are still returned on `/api/v1/tenders`:
  - `items` (alias of `data`)
  - `pageSize` (alias of `meta.limit`)
  - `page`, `totalItems`, `totalPages`
- These legacy fields are **deprecated** and retained only for backward compatibility.

## Run locally

```bash
npm install
npm run start:api
npm test
```

## Postgres migration

```bash
psql "$DATABASE_URL" -f apps/api/migrations/001_init.sql
```

## Docs

- `docs/architecture.md`
- `docs/implementation-roadmap.md`
- `docs/setup.md`
