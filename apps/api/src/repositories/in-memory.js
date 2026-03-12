function paginate(data, page, limit) {
  const start = (page - 1) * limit;
  const sliced = data.slice(start, start + limit);
  return {
    data: sliced,
    meta: {
      page,
      limit,
      total: data.length,
      hasNext: start + limit < data.length
    }
  };
}

export class InMemoryUserRepository {
  constructor(db) { this.db = db; }
  createUser(input) { this.db.users.push(input); return input; }
  findUserByEmail(email) { return this.db.users.find((u) => u.email === email) || null; }
  findUserById(id) { return this.db.users.find((u) => u.id === id) || null; }
}

export class InMemoryOrganizationRepository {
  constructor(db) { this.db = db; }
  createOrganization(input) { this.db.organizations.push(input); return input; }
  findOrganizationById(id) { return this.db.organizations.find((o) => o.id === id) || null; }
  createMembership(input) { this.db.memberships.push(input); return input; }
  findMembership(userId, orgId) { return this.db.memberships.find((m) => m.userId === userId && m.orgId === orgId) || null; }
  listOrganizationsForUser(userId) {
    const orgIds = this.db.memberships.filter((m) => m.userId === userId).map((m) => m.orgId);
    return this.db.organizations.filter((o) => orgIds.includes(o.id));
  }
  listMembershipsByOrg(orgId) { return this.db.memberships.filter((m) => m.orgId === orgId); }
}

export class InMemoryTenderRepository {
  constructor(db) { this.db = db; }
  listTenders({ q, category, page, limit }) {
    const query = (q || "").toLowerCase();
    const out = this.db.tenders.filter((t) => {
      const mq = !query || t.title.toLowerCase().includes(query) || t.organization.toLowerCase().includes(query) || t.location.toLowerCase().includes(query);
      const mc = !category || t.category === category;
      return mq && mc;
    });
    return paginate(out, page, limit);
  }
  findTenderByExternalId(externalId) { return this.db.tenders.find((t) => t.id === externalId) || null; }
}

export class InMemoryBookmarkRepository {
  constructor(db) { this.db = db; }
  createBookmarkIfNotExists({ id, userId, tenderId, createdAt }) {
    const existing = this.db.bookmarks.find((b) => b.userId === userId && b.tenderId === tenderId);
    if (existing) return { bookmark: existing, created: false };
    const bookmark = { id, userId, tenderId, createdAt };
    this.db.bookmarks.push(bookmark);
    return { bookmark, created: true };
  }
  listBookmarksByUser(userId) { return this.db.bookmarks.filter((b) => b.userId === userId); }
}

export class InMemoryRefreshTokenRepository {
  constructor(db) { this.db = db; }
  createToken(input) { this.db.refreshTokens.push(input); return input; }
  findByTokenHash(tokenHash) { return this.db.refreshTokens.find((t) => t.tokenHash === tokenHash) || null; }
  revokeToken(id, revokedAt) {
    const t = this.db.refreshTokens.find((x) => x.id === id);
    if (t) { t.revoked = true; t.lastUsedAt = revokedAt; }
    return t || null;
  }
  revokeAllForUser(userId, revokedAt) {
    this.db.refreshTokens.filter((t) => t.userId === userId && !t.revoked).forEach((t) => { t.revoked = true; t.lastUsedAt = revokedAt; });
  }
}

export class InMemoryAuditLogRepository {
  constructor(db) { this.db = db; }
  createLog(input) { this.db.auditLogs.push(input); return input; }
  listLogs({ action } = {}) { return this.db.auditLogs.filter((l) => !action || l.action === action); }
}
