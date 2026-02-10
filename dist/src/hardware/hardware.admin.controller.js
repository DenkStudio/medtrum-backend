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
exports.HardwareAdminController = void 0;
const common_1 = require("@nestjs/common");
const hardware_admin_service_1 = require("./hardware.admin.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const query_options_dto_1 = require("../common/query/query-options.dto");
const user_decorator_1 = require("../common/decorators/user.decorator");
let HardwareAdminController = class HardwareAdminController {
    constructor(service) {
        this.service = service;
    }
    findAll(query, user) {
        return this.service.findAll(query, user);
    }
    getChartByType(user) {
        return this.service.getChartByType(user);
    }
    getErrorsByProduct(user) {
        return this.service.getErrorsByProduct(user);
    }
    findByUserId(userId) {
        return this.service.findByUserId(userId);
    }
    findOne(id, user) {
        return this.service.findOne(id, user);
    }
    assign(hardwareId, body, user) {
        return this.service.assign(hardwareId, body.userId, user.userId, body.observations);
    }
    returnHardware(hardwareId, body, user) {
        return this.service.returnHardware(hardwareId, user.userId, body.observations);
    }
    transfer(hardwareId, body, user) {
        return this.service.transfer(hardwareId, body.userId, user.userId, body.observations);
    }
};
exports.HardwareAdminController = HardwareAdminController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_options_dto_1.QueryOptionsDto, Object]),
    __metadata("design:returntype", void 0)
], HardwareAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("chart/by-type"),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HardwareAdminController.prototype, "getChartByType", null);
__decorate([
    (0, common_1.Get)("chart/errors-by-product"),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HardwareAdminController.prototype, "getErrorsByProduct", null);
__decorate([
    (0, common_1.Get)("user/:userId"),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HardwareAdminController.prototype, "findByUserId", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HardwareAdminController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(":id/assign"),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], HardwareAdminController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)(":id/return"),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], HardwareAdminController.prototype, "returnHardware", null);
__decorate([
    (0, common_1.Post)(":id/transfer"),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], HardwareAdminController.prototype, "transfer", null);
exports.HardwareAdminController = HardwareAdminController = __decorate([
    (0, common_1.Controller)("admin/hardware"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [hardware_admin_service_1.HardwareAdminService])
], HardwareAdminController);
//# sourceMappingURL=hardware.admin.controller.js.map