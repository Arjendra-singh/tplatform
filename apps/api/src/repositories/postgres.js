/* Postgres adapter using node-postgres compatible `client.query(sql, params)` API. */

export class PostgresUserRepository {
  constructor(client) { this.client = client; }
  async createUser(input) {
    const q = `insert into users (id,email,password_hash,name,created_at) values ($1,$2,$3,$4,$5) returning id,email,password_hash as "passwordHash",name as "fullName",created_at as "createdAt"`;
    const r = await this.client.query(q, [input.id, input.email, input.passwordHash, input.fullName, input.createdAt]);
    return { ...r.rows[0], organizationId: input.organizationId, role: input.role };
  }
  async findUserByEmail(email) {
    const r = await this.client.query(`select u.id,u.email,u.password_hash as "passwordHash",u.name as "fullName",u.created_at as "createdAt",m.org_id as "organizationId",m.role from users u left join memberships m on m.user_id=u.id where u.email=$1 order by m.created_at asc limit 1`, [email]);
    return r.rows[0] || null;
  }
  async findUserById(id) {
    const r = await this.client.query(`select u.id,u.email,u.password_hash as "passwordHash",u.name as "fullName",u.created_at as "createdAt",m.org_id as "organizationId",m.role from users u left join memberships m on m.user_id=u.id where u.id=$1 order by m.created_at asc limit 1`, [id]);
    return r.rows[0] || null;
  }
}

export class PostgresOrganizationRepository {
  constructor(client) { this.client = client; }
  async createOrganization(input) {
    const r = await this.client.query(`insert into organizations (id,name,created_at) values ($1,$2,$3) returning id,name,created_at as "createdAt"`, [input.id, input.name, input.createdAt]);
    return r.rows[0];
  }
  async findOrganizationById(id) { const r = await this.client.query(`select id,name,created_at as "createdAt" from organizations where id=$1`, [id]); return r.rows[0] || null; }
  async createMembership(input) {
    const r = await this.client.query(`insert into memberships (id,user_id,org_id,role,created_at) values ($1,$2,$3,$4,$5) returning id,user_id as "userId",org_id as "orgId",role,created_at as "createdAt"`, [input.id, input.userId, input.orgId, input.role, input.createdAt]);
    return r.rows[0];
  }
  async findMembership(userId, orgId) { const r = await this.client.query(`select id,user_id as "userId",org_id as "orgId",role,created_at as "createdAt" from memberships where user_id=$1 and org_id=$2 limit 1`, [userId, orgId]); return r.rows[0] || null; }
  async listOrganizationsForUser(userId) { const r = await this.client.query(`select o.id,o.name,o.created_at as "createdAt" from organizations o inner join memberships m on m.org_id=o.id where m.user_id=$1`, [userId]); return r.rows; }
  async listMembershipsByOrg(orgId) { const r = await this.client.query(`select id,user_id as "userId",org_id as "orgId",role,created_at as "createdAt" from memberships where org_id=$1`, [orgId]); return r.rows; }
}

export class PostgresTenderRepository {
  constructor(client) { this.client = client; }
  async listTenders({ q, category, page, limit }) {
    const offset = (page - 1) * limit;
    const params = [];
    let where = " where 1=1 ";
    if (q) { params.push(`%${q}%`); where += ` and (title ilike $${params.length} or category ilike $${params.length})`; }
    if (category) { params.push(category); where += ` and category=$${params.length}`; }
    const total = await this.client.query(`select count(*)::int as total from tenders ${where}`, params);
    params.push(limit); params.push(offset);
    const rows = await this.client.query(`select id as "id",title,category,metadata,external_id as "externalId",created_at as "createdAt" from tenders ${where} order by created_at desc limit $${params.length-1} offset $${params.length}`, params);
    return { data: rows.rows, meta: { page, limit, total: total.rows[0].total, hasNext: offset + limit < total.rows[0].total } };
  }
  async findTenderByExternalId(externalId) { const r = await this.client.query(`select metadata from tenders where external_id=$1 limit 1`, [externalId]); return r.rows[0]?.metadata || null; }
}

export class PostgresBookmarkRepository {
  constructor(client) { this.client = client; }
  async createBookmarkIfNotExists({ id, userId, tenderId, createdAt }) {
    const r = await this.client.query(`insert into bookmarks (id,user_id,tender_id,created_at) values ($1,$2,$3,$4) on conflict (user_id,tender_id) do nothing returning id,user_id as "userId",tender_id as "tenderId",created_at as "createdAt"`, [id, userId, tenderId, createdAt]);
    if (r.rows[0]) return { bookmark: r.rows[0], created: true };
    const ex = await this.client.query(`select id,user_id as "userId",tender_id as "tenderId",created_at as "createdAt" from bookmarks where user_id=$1 and tender_id=$2`, [userId, tenderId]);
    return { bookmark: ex.rows[0], created: false };
  }
  async listBookmarksByUser(userId) { const r = await this.client.query(`select id,user_id as "userId",tender_id as "tenderId",created_at as "createdAt" from bookmarks where user_id=$1`, [userId]); return r.rows; }
}

export class PostgresRefreshTokenRepository {
  constructor(client) { this.client = client; }
  async createToken(input) {
    const r = await this.client.query(`insert into refresh_tokens (id,user_id,token_hash,device_info,created_at,last_used_at,revoked) values ($1,$2,$3,$4::jsonb,$5,$6,$7) returning id,user_id as "userId",token_hash as "tokenHash",device_info as "deviceInfo",created_at as "createdAt",last_used_at as "lastUsedAt",revoked`, [input.id,input.userId,input.tokenHash,JSON.stringify(input.deviceInfo||{}),input.createdAt,input.lastUsedAt||null,input.revoked||false]);
    return r.rows[0];
  }
  async findByTokenHash(tokenHash) { const r = await this.client.query(`select id,user_id as "userId",token_hash as "tokenHash",device_info as "deviceInfo",created_at as "createdAt",last_used_at as "lastUsedAt",revoked from refresh_tokens where token_hash=$1 limit 1`, [tokenHash]); return r.rows[0] || null; }
  async revokeToken(id, revokedAt) { const r = await this.client.query(`update refresh_tokens set revoked=true,last_used_at=$2 where id=$1 returning id,user_id as "userId",token_hash as "tokenHash",device_info as "deviceInfo",created_at as "createdAt",last_used_at as "lastUsedAt",revoked`, [id, revokedAt]); return r.rows[0]||null; }
  async revokeAllForUser(userId, revokedAt) { await this.client.query(`update refresh_tokens set revoked=true,last_used_at=$2 where user_id=$1 and revoked=false`, [userId, revokedAt]); }
}

export class PostgresAuditLogRepository {
  constructor(client) { this.client = client; }
  async createLog(input) {
    const r = await this.client.query(`insert into audit_logs (id,user_id,org_id,action,payload,created_at) values ($1,$2,$3,$4,$5::jsonb,$6) returning id,user_id as "userId",org_id as "orgId",action,payload,created_at as "createdAt"`, [input.id, input.userId || null, input.orgId || null, input.action, JSON.stringify(input.payload || {}), input.createdAt]);
    return r.rows[0];
  }
  async listLogs({ action } = {}) {
    if (action) {
      const r = await this.client.query(`select id,user_id as "userId",org_id as "orgId",action,payload,created_at as "createdAt" from audit_logs where action=$1 order by created_at desc`, [action]);
      return r.rows;
    }
    const r = await this.client.query(`select id,user_id as "userId",org_id as "orgId",action,payload,created_at as "createdAt" from audit_logs order by created_at desc`);
    return r.rows;
  }
}


export class PostgresDocumentRepository {
  constructor(client) { this.client = client; }

  async createFolder(input) {
    const r = await this.client.query(`insert into document_folders (id,org_id,name,created_by,created_at,updated_at,deleted_at) values ($1,$2,$3,$4,$5,$6,$7) returning id,org_id as "orgId",name,created_by as "createdBy",created_at as "createdAt",updated_at as "updatedAt",deleted_at as "deletedAt"`, [input.id, input.orgId, input.name, input.createdBy, input.createdAt, input.updatedAt, input.deletedAt || null]);
    return r.rows[0];
  }

  async listFoldersByOrg(orgId) {
    const r = await this.client.query(`select id,org_id as "orgId",name,created_by as "createdBy",created_at as "createdAt",updated_at as "updatedAt",deleted_at as "deletedAt" from document_folders where org_id=$1 and deleted_at is null order by created_at desc`, [orgId]);
    return r.rows;
  }

  async findFolderById(folderId) {
    const r = await this.client.query(`select id,org_id as "orgId",name,created_by as "createdBy",created_at as "createdAt",updated_at as "updatedAt",deleted_at as "deletedAt" from document_folders where id=$1 and deleted_at is null limit 1`, [folderId]);
    return r.rows[0] || null;
  }

  async renameFolder(folderId, name, updatedAt) {
    const r = await this.client.query(`update document_folders set name=$2,updated_at=$3 where id=$1 and deleted_at is null returning id,org_id as "orgId",name,created_by as "createdBy",created_at as "createdAt",updated_at as "updatedAt",deleted_at as "deletedAt"`, [folderId, name, updatedAt]);
    return r.rows[0] || null;
  }

  async createFile(input) {
    const r = await this.client.query(`insert into document_files (id,org_id,folder_id,name,mime_type,size_bytes,created_by,created_at,updated_at,deleted_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning id,org_id as "orgId",folder_id as "folderId",name,mime_type as "mimeType",size_bytes as "sizeBytes",created_by as "createdBy",created_at as "createdAt",updated_at as "updatedAt",deleted_at as "deletedAt"`, [input.id,input.orgId,input.folderId,input.name,input.mimeType,input.sizeBytes,input.createdBy,input.createdAt,input.updatedAt,input.deletedAt || null]);
    return r.rows[0];
  }

  async listFilesByFolder(folderId) {
    const r = await this.client.query(`select id,org_id as "orgId",folder_id as "folderId",name,mime_type as "mimeType",size_bytes as "sizeBytes",created_by as "createdBy",created_at as "createdAt",updated_at as "updatedAt",deleted_at as "deletedAt" from document_files where folder_id=$1 and deleted_at is null order by created_at desc`, [folderId]);
    return r.rows;
  }

  async findFileById(fileId) {
    const r = await this.client.query(`select id,org_id as "orgId",folder_id as "folderId",name,mime_type as "mimeType",size_bytes as "sizeBytes",created_by as "createdBy",created_at as "createdAt",updated_at as "updatedAt",deleted_at as "deletedAt" from document_files where id=$1 and deleted_at is null limit 1`, [fileId]);
    return r.rows[0] || null;
  }

  async createFileVersion(input) {
    const r = await this.client.query(`insert into document_file_versions (id,file_id,version,storage_key,checksum,size_bytes,created_by,created_at) values ($1,$2,$3,$4,$5,$6,$7,$8) returning id,file_id as "fileId",version,storage_key as "storageKey",checksum,size_bytes as "sizeBytes",created_by as "createdBy",created_at as "createdAt"`, [input.id,input.fileId,input.version,input.storageKey,input.checksum,input.sizeBytes,input.createdBy,input.createdAt]);
    return r.rows[0];
  }

  async listFileVersions(fileId) {
    const r = await this.client.query(`select id,file_id as "fileId",version,storage_key as "storageKey",checksum,size_bytes as "sizeBytes",created_by as "createdBy",created_at as "createdAt" from document_file_versions where file_id=$1 order by version asc`, [fileId]);
    return r.rows;
  }
}
