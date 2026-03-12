import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { createServer, createAppState } from "../src/server.js";
import { signJwt } from "../src/lib/jwt.js";

async function startTestServer() {
  const state = createAppState();
  const server = createServer({ state, adapter: "memory" });
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  return { server, baseUrl: `http://127.0.0.1:${address.port}`, state };
}

async function register(baseUrl, email = "owner@org.com") {
  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ fullName: "Owner", email, password: "pass123", organizationName: "OrgA" })
  });
  return { response, body: await response.json() };
}

async function login(baseUrl, email = "owner@org.com", password = "pass123") {
  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return { response, body: await response.json() };
}

test("health and meta remain backward compatible", async () => {
  const { server, baseUrl, state } = await startTestServer();
  try {
    assert.equal((await fetch(`${baseUrl}/health`)).status, 200);
    assert.equal((await fetch(`${baseUrl}/api/v1/meta`)).status, 200);
  } finally { server.close(); }
});

test("login success and failure", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    await register(baseUrl);
    const ok = await login(baseUrl);
    assert.equal(ok.response.status, 200);
    assert.ok(ok.body.accessToken);

    const bad = await login(baseUrl, "owner@org.com", "bad");
    assert.equal(bad.response.status, 401);
    assert.deepEqual(bad.body, { error: "unauthorized", message: "Invalid credentials" });
  } finally { server.close(); }
});

test("refresh rotation and reuse rejection revokes all tokens", async () => {
  const { server, baseUrl, state } = await startTestServer();
  try {
    const reg = await register(baseUrl);
    const oldToken = reg.body.refreshToken;

    const first = await fetch(`${baseUrl}/api/v1/auth/refresh`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ refreshToken: oldToken }) });
    assert.equal(first.status, 200);

    const reuse = await fetch(`${baseUrl}/api/v1/auth/refresh`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ refreshToken: oldToken }) });
    const rb = await reuse.json();
    assert.equal(reuse.status, 401);
    assert.deepEqual(rb, { error: "unauthorized", message: "Invalid or expired token" });
    assert.ok(state.refreshTokens.every((t) => t.revoked));
    assert.ok(state.auditLogs.some((x) => x.action === "auth.refresh.reuse_detected"));
  } finally { server.close(); }
});

test("refresh tokens are stored hashed", async () => {
  const { server, baseUrl, state } = await startTestServer();
  try {
    const reg = await register(baseUrl);
    assert.notEqual(state.refreshTokens[0].tokenHash, reg.body.refreshToken);
  } finally { server.close(); }
});

test("rate limiting on login", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    await register(baseUrl);
    for (let i = 0; i < 5; i += 1) assert.equal((await login(baseUrl, "owner@org.com", "wrong")).response.status, 401);
    assert.equal((await login(baseUrl, "owner@org.com", "wrong")).response.status, 429);
  } finally { server.close(); }
});

test("owner can list orgs while member denied on owner/admin route", async () => {
  const { server, baseUrl, state } = await startTestServer();
  try {
    const reg = await register(baseUrl);
    assert.equal((await fetch(`${baseUrl}/api/v1/organizations`, { headers: { authorization: `Bearer ${reg.body.accessToken}` } })).status, 200);

    const memberId = "USR-MEMBER";
    state.users.push({ id: memberId, fullName: "Member", email: "m@org.com", passwordHash: "x", organizationId: reg.body.organization.id, role: "member", createdAt: new Date().toISOString() });
    state.memberships.push({ id: crypto.randomUUID(), userId: memberId, orgId: reg.body.organization.id, role: "member", createdAt: new Date().toISOString() });
    const memberToken = signJwt({ sub: memberId, type: "access", orgId: reg.body.organization.id, role: "member" }, process.env.JWT_SECRET || "changeme", 600);

    const denied = await fetch(`${baseUrl}/api/v1/organizations/${reg.body.organization.id}/members`, { headers: { authorization: `Bearer ${memberToken}` } });
    assert.equal(denied.status, 403);
  } finally { server.close(); }
});

test("cross-org bookmark rejected and idempotent for same org", async () => {
  const { server, baseUrl, state } = await startTestServer();
  try {
    const reg = await register(baseUrl);
    state.tenders.find((t) => t.id === "TND-2025-0101").orgId = reg.body.organization.id;
    const h = { authorization: `Bearer ${reg.body.accessToken}` };
    const one = await fetch(`${baseUrl}/api/v1/tenders/TND-2025-0101/bookmark`, { method: "POST", headers: h });
    const oneBody = await one.json();
    assert.equal(one.status, 200);
    assert.equal(oneBody.data.created, true);

    const two = await fetch(`${baseUrl}/api/v1/tenders/TND-2025-0101/bookmark`, { method: "POST", headers: h });
    const twoBody = await two.json();
    assert.equal(two.status, 200);
    assert.equal(twoBody.data.created, false);

    assert.equal((await fetch(`${baseUrl}/api/v1/tenders/TND-2025-0102/bookmark`, { method: "POST", headers: h })).status, 403);
  } finally { server.close(); }
});

test("bookmarks list and audit logging", async () => {
  const { server, baseUrl, state } = await startTestServer();
  try {
    const reg = await register(baseUrl);
    state.tenders.find((t) => t.id === "TND-2025-0101").orgId = reg.body.organization.id;
    await login(baseUrl, "owner@org.com", "wrong");
    const ok = await login(baseUrl);
    await fetch(`${baseUrl}/api/v1/tenders/TND-2025-0101/bookmark`, { method: "POST", headers: { authorization: `Bearer ${ok.body.accessToken}` } });
    const list = await fetch(`${baseUrl}/api/v1/tenders/bookmarks`, { headers: { authorization: `Bearer ${ok.body.accessToken}` } });
    const body = await list.json();
    assert.equal(body.meta.total, 1);
    assert.ok(state.auditLogs.some((x) => x.action === "auth.login.failure"));
    assert.ok(state.auditLogs.some((x) => x.action === "tender.bookmark"));
  } finally { server.close(); }
});

test("tenders includes canonical and legacy pagination", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/api/v1/tenders?page=1&limit=1`);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.meta.limit, 1);
    assert.equal(body.pageSize, 1);
    assert.ok(Array.isArray(body.data));
    assert.ok(Array.isArray(body.items));
  } finally { server.close(); }
});
