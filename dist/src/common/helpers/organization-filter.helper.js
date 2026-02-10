"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOrgFilter = buildOrgFilter;
exports.getCreateOrgId = getCreateOrgId;
exports.canAccessOrg = canAccessOrg;
const common_1 = require("@nestjs/common");
function buildOrgFilter(user) {
    if (user.role === "superadmin") {
        return {};
    }
    if (!user.orgId) {
        throw new common_1.ForbiddenException("User has no organization assigned");
    }
    return { organizationId: user.orgId };
}
function getCreateOrgId(user, requestedOrgId) {
    if (user.role === "superadmin") {
        return requestedOrgId;
    }
    if (!user.orgId) {
        throw new common_1.ForbiddenException("User has no organization assigned");
    }
    return user.orgId;
}
function canAccessOrg(user, targetOrgId) {
    if (user.role === "superadmin")
        return true;
    if (!targetOrgId)
        return true;
    return user.orgId === targetOrgId;
}
//# sourceMappingURL=organization-filter.helper.js.map