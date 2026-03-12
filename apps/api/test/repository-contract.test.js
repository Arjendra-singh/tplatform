import test from "node:test";
import assert from "node:assert/strict";
import {
  InMemoryUserRepository,
  InMemoryOrganizationRepository,
  InMemoryTenderRepository,
  InMemoryBookmarkRepository,
  InMemoryRefreshTokenRepository,
  InMemoryAuditLogRepository
} from "../src/repositories/in-memory.js";
import {
  PostgresUserRepository,
  PostgresOrganizationRepository,
  PostgresBookmarkRepository,
  PostgresRefreshTokenRepository,
  PostgresAuditLogRepository
} from "../src/repositories/postgres.js";

function makeMemory() {
  const db = { users: [], organizations: [], memberships: [], tenders: [], bookmarks: [], refreshTokens: [], auditLogs: [] };
  return {
    users: new InMemoryUserRepository(db),
    orgs: new InMemoryOrganizationRepository(db),
    bookmarks: new InMemoryBookmarkRepository(db),
    refresh: new InMemoryRefreshTokenRepository(db),
    audit: new InMemoryAuditLogRepository(db)
  };
}

function makePgMock() {
  const rows = { users: [], organizations: [], memberships: [], bookmarks: [], refresh_tokens: [], audit_logs: [] };
  const client = {
    async query(sql, params) {
      if (sql.startsWith("insert into organizations")) { const r = { id: params[0], name: params[1], createdAt: params[2] }; rows.organizations.push(r); return { rows: [r] }; }
      if (sql.startsWith("insert into users")) { const r = { id: params[0], email: params[1], passwordHash: params[2], fullName: params[3], createdAt: params[4] }; rows.users.push(r); return { rows: [r] }; }
      if (sql.startsWith("insert into memberships")) { const r = { id: params[0], userId: params[1], orgId: params[2], role: params[3], createdAt: params[4] }; rows.memberships.push(r); return { rows: [r] }; }
      if (sql.includes("from users u") && sql.includes("where u.email")) {
        const u = rows.users.find((x) => x.email === params[0]);
        if (!u) return { rows: [] };
        const m = rows.memberships.find((x) => x.userId === u.id);
        return { rows: [{ ...u, organizationId: m?.orgId, role: m?.role }] };
      }
      if (sql.includes("from users u") && sql.includes("where u.id")) {
        const u = rows.users.find((x) => x.id === params[0]);
        if (!u) return { rows: [] };
        const m = rows.memberships.find((x) => x.userId === u.id);
        return { rows: [{ ...u, organizationId: m?.orgId, role: m?.role }] };
      }
      if (sql.startsWith("insert into refresh_tokens")) { const r = { id: params[0], userId: params[1], tokenHash: params[2], deviceInfo: JSON.parse(params[3]), createdAt: params[4], lastUsedAt: params[5], revoked: params[6] }; rows.refresh_tokens.push(r); return { rows: [r] }; }
      if (sql.includes("from refresh_tokens where token_hash")) { const r = rows.refresh_tokens.find((x) => x.tokenHash === params[0]); return { rows: r ? [r] : [] }; }
      if (sql.startsWith("update refresh_tokens set revoked=true,last_used_at=$2 where id=$1")) { const r = rows.refresh_tokens.find((x) => x.id === params[0]); if (r) { r.revoked = true; r.lastUsedAt = params[1]; } return { rows: r ? [r] : [] }; }
      if (sql.startsWith("update refresh_tokens set revoked=true,last_used_at=$2 where user_id=$1")) { rows.refresh_tokens.filter((x) => x.userId === params[0]).forEach((r) => { r.revoked = true; r.lastUsedAt = params[1]; }); return { rows: [] }; }
      if (sql.startsWith("insert into bookmarks")) {
        const ex = rows.bookmarks.find((x) => x.userId === params[1] && x.tenderId === params[2]);
        if (ex) return { rows: [] };
        const r = { id: params[0], userId: params[1], tenderId: params[2], createdAt: params[3] }; rows.bookmarks.push(r); return { rows: [r] };
      }
      if (sql.startsWith("select id,user_id") && sql.includes("from bookmarks where user_id=$1 and tender_id=$2")) { const r = rows.bookmarks.find((x) => x.userId === params[0] && x.tenderId === params[1]); return { rows: r ? [r] : [] }; }
      if (sql.startsWith("select id,user_id") && sql.includes("from bookmarks where user_id=$1")) { return { rows: rows.bookmarks.filter((x) => x.userId === params[0]) }; }
      if (sql.startsWith("insert into audit_logs")) { const r = { id: params[0], userId: params[1], orgId: params[2], action: params[3], payload: JSON.parse(params[4]), createdAt: params[5] }; rows.audit_logs.push(r); return { rows: [r] }; }
      if (sql.includes("from organizations where id=$1")) { const r = rows.organizations.find((x) => x.id === params[0]); return { rows: r ? [r] : [] }; }
      if (sql.includes("from memberships where user_id=$1 and org_id=$2")) { const r = rows.memberships.find((x) => x.userId === params[0] && x.orgId === params[1]); return { rows: r ? [r] : [] }; }
      if (sql.includes("from organizations o inner join memberships")) { const orgIds = rows.memberships.filter((m) => m.userId === params[0]).map((m) => m.orgId); return { rows: rows.organizations.filter((o) => orgIds.includes(o.id)) }; }
      if (sql.includes("from memberships where org_id=$1")) { return { rows: rows.memberships.filter((m) => m.orgId === params[0]) }; }
      if (sql.includes("from audit_logs where action=$1")) return { rows: rows.audit_logs.filter((a) => a.action === params[0]) };
      if (sql.includes("from audit_logs order by")) return { rows: rows.audit_logs };
      throw new Error(`Unhandled SQL: ${sql}`);
    }
  };

  return {
    users: new PostgresUserRepository(client),
    orgs: new PostgresOrganizationRepository(client),
    bookmarks: new PostgresBookmarkRepository(client),
    refresh: new PostgresRefreshTokenRepository(client),
    audit: new PostgresAuditLogRepository(client)
  };
}

for (const [name, factory] of [["memory", makeMemory], ["postgres-mock", makePgMock]]) {
  test(`repository contract parity (${name})`, async () => {
    const r = factory();
    const org = await r.orgs.createOrganization({ id: "ORG-1", name: "Org", createdAt: new Date().toISOString() });
    const user = await r.users.createUser({ id: "USR-1", fullName: "U", email: "u@x.com", passwordHash: "h", organizationId: org.id, role: "owner", createdAt: new Date().toISOString() });
    await r.orgs.createMembership({ id: "M-1", userId: user.id, orgId: org.id, role: "owner", createdAt: new Date().toISOString() });
    assert.equal((await r.users.findUserByEmail("u@x.com")).id, "USR-1");
    assert.equal((await r.orgs.findOrganizationById("ORG-1")).name, "Org");

    const b1 = await r.bookmarks.createBookmarkIfNotExists({ id: "B-1", userId: "USR-1", tenderId: "T-1", createdAt: new Date().toISOString() });
    const b2 = await r.bookmarks.createBookmarkIfNotExists({ id: "B-2", userId: "USR-1", tenderId: "T-1", createdAt: new Date().toISOString() });
    assert.equal(b1.created, true);
    assert.equal(b2.created, false);

    await r.refresh.createToken({ id: "R-1", userId: "USR-1", tokenHash: "abc", deviceInfo: {}, createdAt: new Date().toISOString(), revoked: false });
    assert.equal((await r.refresh.findByTokenHash("abc")).id, "R-1");
    await r.refresh.revokeToken("R-1", new Date().toISOString());
    assert.equal((await r.refresh.findByTokenHash("abc")).revoked, true);

    await r.audit.createLog({ id: "A-1", userId: "USR-1", orgId: "ORG-1", action: "x", payload: {}, createdAt: new Date().toISOString() });
    assert.equal((await r.audit.listLogs({ action: "x" })).length, 1);
  });
}
