# Disaster Recovery Runbook

## Objectives
- **RPO**: 15 minutes
- **RTO**: 2 hours

## Backup Strategy
1. Database logical snapshots every 15 minutes.
2. Daily full backup retained for 35 days.
3. Weekly immutable backup retained for 12 weeks.
4. Object storage versioning enabled for document blobs.

## Drill Procedure (Monthly)
1. Trigger snapshot restore to isolated staging environment.
2. Run schema migrations and integrity checks.
3. Execute API smoke tests (`/health`, auth login, document list).
4. Validate random sample of restored tenders/documents.
5. Record drill timings and gaps.

## Local Validation
Use repository scripts to validate backup artifact handling:

```bash
node apps/api/scripts/backup-state.mjs
node apps/api/scripts/restore-state.mjs <snapshot-file>
```
