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
exports.HealthcareAdminController = void 0;
const common_1 = require("@nestjs/common");
const healthcare_admin_service_1 = require("./healthcare.admin.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const create_healthcare_dto_1 = require("./dto/create-healthcare.dto");
const user_decorator_1 = require("../common/decorators/user.decorator");
const query_options_dto_1 = require("../common/query/query-options.dto");
let HealthcareAdminController = class HealthcareAdminController {
    constructor(healthcareService) {
        this.healthcareService = healthcareService;
    }
    create(body, user) {
        return this.healthcareService.create(body, user);
    }
    findAll(query, user) {
        return this.healthcareService.findAll(query, user);
    }
};
exports.HealthcareAdminController = HealthcareAdminController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)("superadmin", "admin"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_healthcare_dto_1.CreateHealthcareDto, Object]),
    __metadata("design:returntype", void 0)
], HealthcareAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_options_dto_1.QueryOptionsDto, Object]),
    __metadata("design:returntype", void 0)
], HealthcareAdminController.prototype, "findAll", null);
exports.HealthcareAdminController = HealthcareAdminController = __decorate([
    (0, common_1.Controller)("admin/healthcare"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [healthcare_admin_service_1.HealthcareAdminService])
], HealthcareAdminController);
//# sourceMappingURL=healthcare.admin.controller.js.map