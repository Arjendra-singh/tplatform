/**
 * Repository interfaces (duck-typed) used by the server.
 *
 * UserRepository:
 * - createUser(input)
 * - findUserByEmail(email)
 * - findUserById(id)
 *
 * OrganizationRepository:
 * - createOrganization(input)
 * - findOrganizationById(id)
 * - listOrganizationsForUser(userId)
 * - createMembership(input)
 * - findMembership(userId, orgId)
 * - listMembershipsByOrg(orgId)
 *
 * TenderRepository:
 * - listTenders(filters)
 * - findTenderByExternalId(externalId)
 *
 * BookmarkRepository:
 * - createBookmarkIfNotExists(input)
 * - listBookmarksByUser(userId)
 *
 * RefreshTokenRepository:
 * - createToken(input)
 * - findByTokenHash(hash)
 * - revokeToken(id, when)
 * - revokeAllForUser(userId, when)
 *
 * AuditLogRepository:
 * - createLog(input)
 * - listLogs(filters)
 */
export {};
