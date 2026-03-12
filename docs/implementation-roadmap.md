# Implementation Roadmap

## Sprint 0 (current start) — Platform setup

- Finalize architecture and domain model
- Create monorepo structure
- Add CI with lint/test/build gates
- Add coding standards and contribution docs

## Sprint 1 — Auth + organization onboarding

- ✅ User signup/login + refresh lifecycle (initial implementation)
- ✅ Organization workspace creation (initial implementation)
- ✅ RBAC baseline (owner/admin/member) and org-scoped authorization implemented; invitation flow pending
- Basic profile/settings persistence

## Sprint 2 — Tender discovery backend

- Tender source connector framework
- Ingestion scheduler + normalized schema
- ✅ Search/filter APIs with pagination (initial implementation)
- ✅ Replaceable live tender API surface ready for web integration
- ✅ Auth endpoint rate limiting + structured audit logging baseline

## Sprint 3 — Document management

- ✅ Folder/file CRUD APIs + versioning (initial backend implementation complete)
- ✅ Object storage integration baseline (in-memory object storage adapter + storage key flow)
- ✅ Antivirus + MIME validation + OCR/indexing queue baseline (synchronous simulated pipeline + job visibility API)
- ⏳ Replace in-memory document library with persistent data

## Sprint 4 — AI assistant hardening

- ✅ Server-side AI gateway (no client-side key/model calls)
- ✅ File context pipeline baseline + retrieval context API contract (vector index pending)
- ✅ Guardrails + response citations baseline
- ✅ Usage analytics and per-org quota enforcement baseline

## Sprint 5 — Ops + production readiness

- ✅ IaC for cloud deployment (Terraform baseline + k8s deployment manifest)
- ✅ Monitoring dashboards + alerting baseline (Prometheus rules + Grafana dashboard)
- ✅ Disaster recovery drills and backup/restore validation scripts and tests
- ✅ Security review baseline and penetration remediation tracker
- Folder/file CRUD APIs + versioning
- Object storage integration
- Antivirus + MIME validation + OCR/indexing queue
- Replace in-memory document library with persistent data

## Sprint 4 — AI assistant hardening

- Server-side AI gateway (no client-side key/model calls)
- File context pipeline + vector/retrieval strategy
- Guardrails, moderation, and response citation policy
- Usage analytics and per-org quotas

## Sprint 5 — Ops + production readiness

- IaC for cloud deployment
- Monitoring dashboards + alerting
- Disaster recovery drills and backup restore tests
- Security review and penetration test remediation

## Exit criteria for v1 launch

- All critical user journeys covered by automated tests
- Security and compliance controls validated
- Staging soak test passed for 7+ days
- Runbooks complete for incident response and rollback
