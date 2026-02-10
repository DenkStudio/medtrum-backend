import { ForbiddenException } from "@nestjs/common";

export interface AuthUser {
  userId: string;
  role: string;
  orgId?: string;
  patientId?: string;
  educatorId?: string;
}

/**
 * Builds a Prisma where clause that includes organization filtering.
 * Returns undefined organizationId for superadmin (no filter).
 * Returns { organizationId: orgId } for admin.
 */
export function buildOrgFilter(user: AuthUser): { organizationId?: string } {
  if (user.role === "superadmin") {
    return {};
  }
  if (!user.orgId) {
    throw new ForbiddenException("User has no organization assigned");
  }
  return { organizationId: user.orgId };
}

/**
 * Gets the organization ID to assign when creating entities.
 * For admins: uses their organization.
 * For superadmins: requires explicit organizationId in request.
 */
export function getCreateOrgId(
  user: AuthUser,
  requestedOrgId?: string
): string | undefined {
  if (user.role === "superadmin") {
    return requestedOrgId;
  }
  if (!user.orgId) {
    throw new ForbiddenException("User has no organization assigned");
  }
  return user.orgId;
}

/**
 * Checks if user can access a specific organization's data.
 */
export function canAccessOrg(
  user: AuthUser,
  targetOrgId?: string | null
): boolean {
  if (user.role === "superadmin") return true;
  if (!targetOrgId) return true;
  return user.orgId === targetOrgId;
}
