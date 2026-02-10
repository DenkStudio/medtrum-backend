"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimsAdminController = void 0;
const common_1 = require("@nestjs/common");
const claims_admin_service_1 = require("./claims.admin.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const query_options_dto_1 = require("../common/query/query-options.dto");
const user_decorator_1 = require("../common/decorators/user.decorator");
const claims_chart_query_dto_1 = require("./dto/claims-chart-query.dto");
let ClaimsAdminController = class ClaimsAdminController {
    constructor(service) {
        this.service = service;
    }
    findAll(query, user) {
        return this.service.findAll(query, user);
    }
    getChartData(query, user) {
        return this.service.getChartData(query, user);
    }
    getClaimsByUserChart(query, user) {
        return this.service.getClaimsByUserChart(query, user);
    }
    findOne(claimId, user) {
        return this.service.findOne(claimId, user);
    }
    findByUserId(userId, user) {
        return this.service.findByUserId(userId, user);
    }
    setStatus(id, body, user) {
        return this.service.setStatus(id, body.status, body.qty, body.daysReimbursed, body.resolutionMessage, user);
    }
};
exports.ClaimsAdminController = ClaimsAdminController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)("admin", "superadmin", "educator"),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_options_dto_1.QueryOptionsDto, Object]),
    __metadata("design:returntype", void 0)
], ClaimsAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("chart"),
    (0, roles_decorator_1.Roles)("admin", "superadmin", "educator"),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [claims_chart_query_dto_1.ClaimsChartQueryDto, Object]),
    __metadata("design:returntype", void 0)
], ClaimsAdminController.prototype, "getChartData", null);
__decorate([
    (0, common_1.Get)("chart/by-user"),
    (0, roles_decorator_1.Roles)("admin", "superadmin", "educator"),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [claims_chart_query_dto_1.ClaimsChartQueryDto, Object]),
    __metadata("design:returntype", void 0)
], ClaimsAdminController.prototype, "getClaimsByUserChart", null);
__decorate([
    (0, common_1.Get)(":claimId"),
    (0, roles_decorator_1.Roles)("admin", "superadmin", "educator"),
    __param(0, (0, common_1.Param)("claimId")),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ClaimsAdminController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)("user/:userId"),
    (0, roles_decorator_1.Roles)("admin", "superadmin", "educator"),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ClaimsAdminController.prototype, "findByUserId", null);
__decorate([
    (0, common_1.Patch)(":id/status"),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ClaimsAdminController.prototype, "setStatus", null);
exports.ClaimsAdminController = ClaimsAdminController = __decorate([
    (0, common_1.Controller)("admin/claims"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [claims_admin_service_1.ClaimsAdminService])
], ClaimsAdminController);
//# sourceMappingURL=claims.admin.controller.js.map