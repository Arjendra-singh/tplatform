# Security Review & Penetration Remediation

## Review Scope
- Authentication lifecycle (`register`, `login`, `refresh`)
- RBAC and org-scoped access controls
- Document and AI APIs
- Token handling, quotas, and audit logging

## Current Controls
- JWT access tokens with expiration checks.
- Refresh-token rotation with reuse detection and revocation cascade.
- Auth endpoint rate limiting.
- Guardrails on AI prompt content.
- Audit logs for auth/document/AI critical actions.

## Penetration Findings (Baseline) and Remediation Status
1. **Potential weak secret in development defaults**
   - Remediation: enforce `JWT_SECRET` required in prod deployment checks.
2. **No WAF policy attached yet**
   - Remediation: include WAF in platform networking module before prod go-live.
3. **No at-rest encryption validation gate in CI**
   - Remediation: add terraform policy checks in next infra pipeline iteration.
4. **No SAST step in CI**
   - Remediation: add semgrep/gitleaks job to CI workflow.

## Exit Criteria Before Production
- External penetration test executed and all critical/high findings remediated.
- Security sign-off from platform and app owners.
- DR drill completed with RPO/RTO targets met.
