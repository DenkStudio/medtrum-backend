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
exports.UsersAdminController = void 0;
const common_1 = require("@nestjs/common");
const update_user_dto_1 = require("./dto/update-user.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const query_options_dto_1 = require("../common/query/query-options.dto");
const users_admin_service_1 = require("./users.admin.service");
const user_decorator_1 = require("../common/decorators/user.decorator");
const excel_export_service_1 = require("../utils/excel-export.service");
let UsersAdminController = class UsersAdminController {
    constructor(usersAdminService, excelExportService) {
        this.usersAdminService = usersAdminService;
        this.excelExportService = excelExportService;
    }
    createOrUpdate(dto, user) {
        if (dto.id) {
            const { id, ...updateDto } = dto;
            return this.usersAdminService.update(id, updateDto);
        }
        return this.usersAdminService.create(dto, user.userId);
    }
    invite(id) {
        return this.usersAdminService.invite(id);
    }
    update(id, dto) {
        return this.usersAdminService.update(id, dto);
    }
    findAll(query, user) {
        return this.usersAdminService.findAll(query, user);
    }
    getPatientsOverview(user) {
        return this.usersAdminService.getPatientsOverview(user);
    }
    async exportUsersWithClaims(query, user) {
        const users = await this.usersAdminService.getUsers(user, query);
        return this.excelExportService.exportUsers(users);
    }
    findById(id, user) {
        return this.usersAdminService.findById(id, user);
    }
    remove(id) {
        return this.usersAdminService.remove(id);
    }
};
exports.UsersAdminController = UsersAdminController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)("superadmin", "admin"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "createOrUpdate", null);
__decorate([
    (0, common_1.Post)(":id/invite"),
    (0, roles_decorator_1.Roles)("superadmin", "admin"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "invite", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, roles_decorator_1.Roles)("superadmin", "admin"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)("superadmin", "admin"),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_options_dto_1.QueryOptionsDto, Object]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("patients-overview"),
    (0, roles_decorator_1.Roles)("superadmin", "admin"),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "getPatientsOverview", null);
__decorate([
    (0, common_1.Get)("export"),
    (0, roles_decorator_1.Roles)("superadmin", "admin"),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_options_dto_1.QueryOptionsDto, Object]),
    __metadata("design:returntype", Promise)
], UsersAdminController.prototype, "exportUsersWithClaims", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, roles_decorator_1.Roles)("superadmin", "admin"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "findById", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, roles_decorator_1.Roles)("superadmin"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersAdminController.prototype, "remove", null);
exports.UsersAdminController = UsersAdminController = __decorate([
    (0, common_1.Controller)("admin/users"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_admin_service_1.UsersAdminService,
        excel_export_service_1.ExcelExportService])
], UsersAdminController);
//# sourceMappingURL=users.admin.controller.js.map