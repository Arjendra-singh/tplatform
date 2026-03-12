# Production Architecture (v1)

## 1) High-level system

- **Web App (React/Next.js)**
  - User-facing dashboard, discovery, documents, AI assistant
- **API Service (Node.js/NestJS or FastAPI)**
  - Auth, tenders, document management, workflow, notifications
- **AI Orchestrator (server-side module/service)**
  - File parsing, prompt routing, model adapters, policy checks
- **Data Layer**
  - PostgreSQL (OLTP)
  - OpenSearch/Elasticsearch (search)
  - Redis (cache/session/queues)
  - Object storage (S3-compatible) for documents
- **Async layer**
  - Queue workers for ingestion, OCR, indexing, alerts

## 2) Security baseline

- JWT or OIDC auth with short-lived tokens
- Role-based access control (Admin/Manager/Analyst/Viewer)
- API keys and model keys stored only on backend secret manager
- Signed URLs for file access
- Full audit trail for login, document actions, AI usage

## 3) Data domains

- `users`, `organizations`, `memberships`, `roles`
- `tenders`, `tender_sources`, `tender_documents`
- `folders`, `files`, `file_versions`, `file_access_logs`
- `ai_conversations`, `ai_messages`, `ai_artifacts`
- `alerts`, `saved_searches`, `watchlists`

## 4) Non-functional requirements

- P95 API latency < 400ms for core read flows
- RPO <= 15 minutes, RTO <= 2 hours
- 99.9% uptime target for production
- Structured logging + metrics + distributed traces

## 5) Deployments

- Environments: `dev`, `staging`, `prod`
- CI: lint + test + build + container scan
- CD: staged rollout with health checks + rollback support


## 6) Backend implementation notes (current)

- Repository abstraction introduced (`UserRepository`, `OrganizationRepository`, `TenderRepository`) to keep runtime persistence DB-agnostic and PostgreSQL-ready.
- JWT-based access and refresh token lifecycle implemented with refresh-token rotation and reuse rejection.
- API errors standardized to `{ "error": string, "message": string }` for predictable client handling.

- Rate limiting on auth lifecycle endpoints (in-memory now, Redis-ready abstraction next).
- Audit logging repository added for security and traceability of auth and tender actions.
