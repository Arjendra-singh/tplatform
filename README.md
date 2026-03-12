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
- `GET /api/v1/documents/folders`
- `POST /api/v1/documents/folders`
- `PATCH /api/v1/documents/folders/:folderId`
- `GET /api/v1/documents/folders/:folderId/files`
- `POST /api/v1/documents/folders/:folderId/files`
- `GET /api/v1/documents/files/:fileId/versions`
- `POST /api/v1/documents/files/:fileId/versions`
- `GET /api/v1/documents/files/:fileId`
- `GET /api/v1/documents/processing-jobs`
- `POST /api/v1/ai/chat`
- `GET /api/v1/ai/usage`

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

## Sprint 3 status

- ✅ Document folder/file CRUD foundation implemented with version history support.
- ✅ File metadata validation (mime + size bounds) and org-scoped authorization added.
- ✅ Object storage baseline + antivirus/OCR/index pipeline baseline implemented.

## Sprint 4 status

- ✅ Server-side AI gateway endpoint implemented (no client-side model key exposure).
- ✅ File-context retrieval baseline wired from tenders and document metadata.
- ✅ Guardrails + citation-style response payload + per-org usage quotas implemented.
- ⏳ Advanced vector retrieval and model-provider adapters are next.

## Sprint 5 status

- ✅ IaC baseline for cloud deployment added (`ops/iac/terraform`).
- ✅ Monitoring dashboard and alert rules added (`ops/monitoring`).
- ✅ Disaster recovery runbook and backup/restore validation scripts added.
- ✅ Security review and penetration remediation tracker added (`ops/runbooks/security-review.md`).

## Ops Commands

```bash
npm run backup:state
npm run restore:state -- <snapshot-file>
```

## Merge conflict note

- Consolidated environment and roadmap updates from both branches into this branch so PR conflict resolution can be completed cleanly.
