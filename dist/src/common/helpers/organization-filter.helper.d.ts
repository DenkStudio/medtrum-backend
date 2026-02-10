export interface AuthUser {
    userId: string;
    role: string;
    orgId?: string;
    patientId?: string;
    educatorId?: string;
}
export declare function buildOrgFilter(user: AuthUser): {
    organizationId?: string;
};
export declare function getCreateOrgId(user: AuthUser, requestedOrgId?: string): string | undefined;
export declare function canAccessOrg(user: AuthUser, targetOrgId?: string | null): boolean;
//# sourceMappingURL=organization-filter.helper.d.ts.map