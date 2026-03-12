import http from "node:http";
import crypto from "node:crypto";
import { signJwt, verifyJwt } from "./lib/jwt.js";
import { InMemoryRateLimiter } from "./lib/rate-limiter.js";
import {
  InMemoryUserRepository,
  InMemoryOrganizationRepository,
  InMemoryTenderRepository,
  InMemoryBookmarkRepository,
  InMemoryRefreshTokenRepository,
  InMemoryAuditLogRepository
} from "./repositories/in-memory.js";
import {
  PostgresUserRepository,
  PostgresOrganizationRepository,
  PostgresTenderRepository,
  PostgresBookmarkRepository,
  PostgresRefreshTokenRepository,
  PostgresAuditLogRepository
} from "./repositories/postgres.js";

const PRODUCT_NAME = "Tender Sahayak Platform";
const API_VERSION = "v1";

const DEFAULT_ORG_ID = "ORG-0001";
const DEFAULT_TENDERS = [
  { id: "TND-2025-0100", organization: "NRIDA", orgId: DEFAULT_ORG_ID, title: "Construction of Rural Roads under PMGSY Phase-III", category: "Infrastructure", location: "Rajasthan", valueInr: 4500000, status: "open", details: { source: "CPPP", deadline: "2025-03-25" } },
  { id: "TND-2025-0101", organization: "BSNL Corporate Office", orgId: DEFAULT_ORG_ID, title: "Procurement of IT Equipment & Networking Hardware", category: "IT / Technology", location: "Delhi", valueInr: 7850000, status: "open", details: { source: "GeM", deadline: "2025-03-28" } },
  { id: "TND-2025-0102", organization: "State Public Works", orgId: "ORG-0002", title: "State Highway Maintenance", category: "Infrastructure", location: "Karnataka", valueInr: 23000000, status: "open", details: { source: "State eProc", deadline: "2025-04-01" } }
];

const ACCESS_TOKEN_EXP = process.env.ACCESS_TOKEN_EXP || "15m";
const REFRESH_TOKEN_EXP = process.env.REFRESH_TOKEN_EXP || "30d";

function parseDurationToSec(v) {
  const s = String(v).trim();
  const m = s.match(/^(\d+)([smhd])$/i);
  if (!m) return 900;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  if (unit === "s") return n;
  if (unit === "m") return n * 60;
  if (unit === "h") return n * 3600;
  return n * 86400;
}

const ACCESS_TOKEN_TTL_SECONDS = parseDurationToSec(ACCESS_TOKEN_EXP);
const REFRESH_TOKEN_TTL_SECONDS = parseDurationToSec(REFRESH_TOKEN_EXP);

function sendJson(res, status, body) { res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(body)); }
function sendError(res, status, error, message) { sendJson(res, status, { error, message }); }
function nowIso() { return new Date().toISOString(); }
function normEmail(email) { return String(email || "").trim().toLowerCase(); }
function hash(v) { return crypto.createHash("sha256").update(String(v)).digest("hex"); }
function passwordHash(password) { return hash(password); }
function verifyPassword(password, digest) { return hash(password) === digest; }
function sanitize(v, max = 80) { return String(v || "").replace(/[^\w\s\-/]/g, "").trim().slice(0, max); }
function parsePosInt(v, fallback, max) { const n = Number(v); if (!Number.isInteger(n) || n < 1) return fallback; return Math.min(max, n); }
function createId(prefix, seq) { return `${prefix}-${String(seq + 1).padStart(4, "0")}`; }
function getTokenSecret() { return process.env.JWT_SECRET || "changeme"; }

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch { reject(new Error("invalid_json")); }
    });
    req.on("error", reject);
  });
}

function extractCookie(req, name) {
  const header = req.headers.cookie || "";
  const parts = header.split(";").map((x) => x.trim());
  const found = parts.find((p) => p.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.split("=").slice(1).join("=")) : "";
}

function getBearerToken(req) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return null;
  return h.slice(7);
}

function issueAccessToken(user, membership) {
  return signJwt({ sub: user.id, type: "access", orgId: membership.orgId, role: membership.role }, getTokenSecret(), ACCESS_TOKEN_TTL_SECONDS);
}

function requireAuth(req, res, repos) {
  const t = getBearerToken(req);
  if (!t) { sendError(res, 401, "unauthorized", "Invalid or expired token"); return null; }
  const v = verifyJwt(t, getTokenSecret());
  if (!v.valid || v.payload.type !== "access") { sendError(res, 401, "unauthorized", "Invalid or expired token"); return null; }
  return v.payload;
}

function requireRole(member, roles, res) {
  if (!roles.includes(member.role)) {
    sendError(res, 403, "forbidden", "Insufficient role for this resource");
    return false;
  }
  return true;
}

function buildDeviceInfo(req) {
  return { ip: req.socket?.remoteAddress || "unknown", userAgent: req.headers["user-agent"] || "unknown" };
}

async function audit(repos, { userId = null, orgId = null, action, payload = {} }) {
  await repos.auditLogs.createLog({ id: crypto.randomUUID(), userId, orgId, action, payload, createdAt: nowIso() });
}

export function createAppState() {
  return {
    users: [], organizations: [{ id: DEFAULT_ORG_ID, name: "Public Procurement Org", createdAt: nowIso() }, { id: "ORG-0002", name: "State Works Org", createdAt: nowIso() }], memberships: [], tenders: [...DEFAULT_TENDERS],
    bookmarks: [], refreshTokens: [], auditLogs: []
  };
}

export async function createRepositories({ adapter = process.env.REPOSITORY_ADAPTER || "memory", state, postgresClient } = {}) {
  if (adapter === "postgres") {
    let client = postgresClient;
    if (!client) {
      throw new Error("Postgres adapter requires injected postgresClient in this environment");
    }
    return {
      users: new PostgresUserRepository(client),
      organizations: new PostgresOrganizationRepository(client),
      tenders: new PostgresTenderRepository(client),
      bookmarks: new PostgresBookmarkRepository(client),
      refreshTokens: new PostgresRefreshTokenRepository(client),
      auditLogs: new PostgresAuditLogRepository(client)
    };
  }
  return {
    users: new InMemoryUserRepository(state),
    organizations: new InMemoryOrganizationRepository(state),
    tenders: new InMemoryTenderRepository(state),
    bookmarks: new InMemoryBookmarkRepository(state),
    refreshTokens: new InMemoryRefreshTokenRepository(state),
    auditLogs: new InMemoryAuditLogRepository(state)
  };
}

function serializeTender(t) { return { id: t.id, title: t.title, organization: t.organization, category: t.category, location: t.location, valueInr: t.valueInr, status: t.status }; }

export function createServer(options = {}) {
  const state = options.state || createAppState();
  const reposPromise = createRepositories({ adapter: options.adapter, state, postgresClient: options.postgresClient });
  const loginLimiter = new InMemoryRateLimiter({ maxAttempts: Number(process.env.RATE_LIMIT_LOGIN || 5), windowSec: Number(process.env.RATE_LIMIT_WINDOW_SEC || 600) });
  const refreshLimiter = new InMemoryRateLimiter({ maxAttempts: Number(process.env.RATE_LIMIT_REFRESH || 10), windowSec: Number(process.env.RATE_LIMIT_WINDOW_SEC || 600) });

  return http.createServer(async (req, res) => {
    const repos = await reposPromise;
    const url = new URL(req.url || "/", "http://localhost");

    if (url.pathname === "/health") return req.method === "GET" ? sendJson(res, 200, { status: "ok" }) : sendError(res, 405, "method_not_allowed", "Method not allowed");
    if (url.pathname === "/api/v1/meta") return req.method === "GET" ? sendJson(res, 200, { product: PRODUCT_NAME, apiVersion: API_VERSION, milestones: ["foundation", "auth-and-onboarding", "tender-discovery", "document-management", "ai-hardening", "ops-readiness"] }) : sendError(res, 405, "method_not_allowed", "Method not allowed");

    if (url.pathname === "/api/v1/auth/register") {
      if (req.method !== "POST") return sendError(res, 405, "method_not_allowed", "Method not allowed");
      let b; try { b = await parseJsonBody(req); } catch { return sendError(res, 400, "invalid_json", "Request body must be valid JSON"); }
      const fullName = String(b.fullName || "").trim(); const email = normEmail(b.email); const password = String(b.password || ""); const organizationName = String(b.organizationName || "").trim();
      if (!fullName || !email || !password || !organizationName) return sendError(res, 400, "validation_error", "Missing required registration fields");
      if (await repos.users.findUserByEmail(email)) return sendError(res, 409, "email_already_exists", "Email is already registered");
      const org = await repos.organizations.createOrganization({ id: createId("ORG", state.organizations.length), name: organizationName, createdAt: nowIso() });
      const user = await repos.users.createUser({ id: createId("USR", state.users.length), fullName, email, passwordHash: passwordHash(password), organizationId: org.id, role: "owner", createdAt: nowIso() });
      const membership = await repos.organizations.createMembership({ id: crypto.randomUUID(), userId: user.id, orgId: org.id, role: "owner", createdAt: nowIso() });
      const accessToken = issueAccessToken(user, membership);
      const rawRefresh = crypto.randomUUID();
      await repos.refreshTokens.createToken({ id: crypto.randomUUID(), userId: user.id, tokenHash: hash(rawRefresh), deviceInfo: buildDeviceInfo(req), createdAt: nowIso(), lastUsedAt: null, revoked: false });
      await audit(repos, { userId: user.id, orgId: org.id, action: "auth.register.success" });
      return sendJson(res, 201, { token: accessToken, accessToken, refreshToken: rawRefresh, user: { id: user.id, fullName: user.fullName, email: user.email, organizationId: org.id, role: membership.role, createdAt: user.createdAt }, organization: org });
    }

    if (url.pathname === "/api/v1/auth/login") {
      if (req.method !== "POST") return sendError(res, 405, "method_not_allowed", "Method not allowed");
      let b; try { b = await parseJsonBody(req); } catch { return sendError(res, 400, "invalid_json", "Request body must be valid JSON"); }
      const email = normEmail(b.email); const password = String(b.password || ""); const ip = req.socket?.remoteAddress || "unknown";
      if (!loginLimiter.check(`login-ip:${ip}`) || (email && !loginLimiter.check(`login-email:${email}`))) return sendError(res, 429, "rate_limited", "Too many authentication attempts");
      const user = await repos.users.findUserByEmail(email);
      if (!user || !verifyPassword(password, user.passwordHash)) { await audit(repos, { userId: user?.id || null, orgId: user?.organizationId || null, action: "auth.login.failure", payload: { email } }); return sendError(res, 401, "unauthorized", "Invalid credentials"); }
      const membership = await repos.organizations.findMembership(user.id, user.organizationId);
      const accessToken = issueAccessToken(user, membership);
      const rawRefresh = crypto.randomUUID();
      await repos.refreshTokens.createToken({ id: crypto.randomUUID(), userId: user.id, tokenHash: hash(rawRefresh), deviceInfo: buildDeviceInfo(req), createdAt: nowIso(), lastUsedAt: null, revoked: false });
      await audit(repos, { userId: user.id, orgId: user.organizationId, action: "auth.login.success" });
      return sendJson(res, 200, { accessToken, refreshToken: rawRefresh, user: { id: user.id, fullName: user.fullName, email: user.email, organizationId: user.organizationId, role: membership.role, createdAt: user.createdAt } });
    }

    if (url.pathname === "/api/v1/auth/refresh") {
      if (req.method !== "POST") return sendError(res, 405, "method_not_allowed", "Method not allowed");
      const ip = req.socket?.remoteAddress || "unknown";
      if (!refreshLimiter.check(`refresh-ip:${ip}`)) return sendError(res, 429, "rate_limited", "Too many authentication attempts");
      let b = {}; try { b = await parseJsonBody(req); } catch { return sendError(res, 400, "invalid_json", "Request body must be valid JSON"); }
      const raw = String(b.refreshToken || extractCookie(req, "refreshToken") || "");
      if (!raw) return sendError(res, 400, "validation_error", "refreshToken is required");
      const row = await repos.refreshTokens.findByTokenHash(hash(raw));
      if (!row) return sendError(res, 401, "unauthorized", "Invalid or expired token");
      if (row.revoked) {
        await repos.refreshTokens.revokeAllForUser(row.userId, nowIso());
        const user = await repos.users.findUserById(row.userId);
        await audit(repos, { userId: row.userId, orgId: user?.organizationId || null, action: "auth.refresh.reuse_detected" });
        return sendError(res, 401, "unauthorized", "Invalid or expired token");
      }
      await repos.refreshTokens.revokeToken(row.id, nowIso());
      const user = await repos.users.findUserById(row.userId);
      if (!user) return sendError(res, 401, "unauthorized", "Invalid or expired token");
      const membership = await repos.organizations.findMembership(user.id, user.organizationId);
      const accessToken = issueAccessToken(user, membership);
      const nextRaw = crypto.randomUUID();
      await repos.refreshTokens.createToken({ id: crypto.randomUUID(), userId: user.id, tokenHash: hash(nextRaw), deviceInfo: buildDeviceInfo(req), createdAt: nowIso(), lastUsedAt: null, revoked: false });
      await audit(repos, { userId: user.id, orgId: user.organizationId, action: "auth.refresh.success" });
      return sendJson(res, 200, { data: { accessToken, refreshToken: nextRaw }, accessToken, refreshToken: nextRaw });
    }

    if (url.pathname === "/api/v1/organizations") {
      if (req.method !== "GET") return sendError(res, 405, "method_not_allowed", "Method not allowed");
      const token = requireAuth(req, res, repos); if (!token) return;
      const member = await repos.organizations.findMembership(token.sub, token.orgId); if (!member) return sendError(res, 403, "forbidden", "Cross-organization access denied");
      if (!requireRole(member, ["owner", "admin"], res)) return;
      const items = await repos.organizations.listOrganizationsForUser(token.sub);
      return sendJson(res, 200, { items });
    }

    const membersMatch = url.pathname.match(/^\/api\/v1\/organizations\/(ORG-\d{4})\/members$/);
    if (membersMatch) {
      if (req.method !== "GET") return sendError(res, 405, "method_not_allowed", "Method not allowed");
      const token = requireAuth(req, res, repos); if (!token) return;
      const orgId = membersMatch[1];
      if (token.orgId !== orgId) return sendError(res, 403, "forbidden", "Cross-organization access denied");
      const member = await repos.organizations.findMembership(token.sub, orgId); if (!member) return sendError(res, 403, "forbidden", "Cross-organization access denied");
      if (!requireRole(member, ["owner", "admin"], res)) return;
      const data = await repos.organizations.listMembershipsByOrg(orgId);
      return sendJson(res, 200, { data });
    }

    if (url.pathname === "/api/v1/tenders") {
      if (req.method !== "GET") return sendError(res, 405, "method_not_allowed", "Method not allowed");
      const allowed = new Set(["q", "category", "page", "pageSize", "limit"]);
      for (const k of url.searchParams.keys()) if (!allowed.has(k)) return sendError(res, 400, "validation_error", `Unsupported query parameter: ${k}`);
      const q = sanitize(url.searchParams.get("q"), 120); const category = sanitize(url.searchParams.get("category"), 40); const page = parsePosInt(url.searchParams.get("page"), 1, 1000); const limit = parsePosInt(url.searchParams.get("limit") || url.searchParams.get("pageSize"), 10, 50);
      const out = await repos.tenders.listTenders({ q, category, page, limit });
      const data = out.data.map(serializeTender);
      return sendJson(res, 200, { data, meta: out.meta, items: data, page: out.meta.page, pageSize: out.meta.limit, totalItems: out.meta.total, totalPages: Math.max(1, Math.ceil(out.meta.total / out.meta.limit)) });
    }

    if (url.pathname === "/api/v1/tenders/bookmarks") {
      if (req.method !== "GET") return sendError(res, 405, "method_not_allowed", "Method not allowed");
      const token = requireAuth(req, res, repos); if (!token) return;
      const bms = await repos.bookmarks.listBookmarksByUser(token.sub);
      const data = [];
      for (const b of bms) { const t = await repos.tenders.findTenderByExternalId(b.tenderId); if (t && t.orgId === token.orgId) data.push(serializeTender(t)); }
      return sendJson(res, 200, { data, meta: { total: data.length } });
    }

    const bookmarkMatch = url.pathname.match(/^\/api\/v1\/tenders\/(TND-\d{4}-\d{4})\/bookmark$/);
    if (bookmarkMatch) {
      if (req.method !== "POST") return sendError(res, 405, "method_not_allowed", "Method not allowed");
      const token = requireAuth(req, res, repos); if (!token) return;
      const tender = await repos.tenders.findTenderByExternalId(bookmarkMatch[1]);
      if (!tender) return sendError(res, 404, "not_found", "Tender not found");
      if (tender.orgId !== token.orgId) return sendError(res, 403, "forbidden", "Cross-organization access denied");
      const member = await repos.organizations.findMembership(token.sub, token.orgId); if (!member) return sendError(res, 403, "forbidden", "Cross-organization access denied");
      const created = await repos.bookmarks.createBookmarkIfNotExists({ id: crypto.randomUUID(), userId: token.sub, tenderId: tender.id, createdAt: nowIso() });
      await audit(repos, { userId: token.sub, orgId: token.orgId, action: "tender.bookmark", payload: { tenderId: tender.id, created: created.created } });
      return sendJson(res, 200, { data: { tenderId: tender.id, bookmarked: true, created: created.created } });
    }

    const tenderMatch = url.pathname.match(/^\/api\/v1\/tenders\/(TND-\d{4}-\d{4})$/);
    if (tenderMatch) {
      if (req.method !== "GET") return sendError(res, 405, "method_not_allowed", "Method not allowed");
      const t = await repos.tenders.findTenderByExternalId(tenderMatch[1]);
      if (!t) return sendError(res, 404, "not_found", "Tender not found");
      return sendJson(res, 200, { data: { ...serializeTender(t), details: t.details } });
    }

    sendError(res, 404, "not_found", "Route not found");
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createServer();
  const port = Number(process.env.PORT || 3001);
  server.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}
