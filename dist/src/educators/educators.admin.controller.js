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
exports.EducatorsAdminController = void 0;
const common_1 = require("@nestjs/common");
const educators_admin_service_1 = require("./educators.admin.service");
const create_educator_dto_1 = require("./dto/create-educator.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_decorator_1 = require("../common/decorators/user.decorator");
const query_options_dto_1 = require("../common/query/query-options.dto");
let EducatorsAdminController = class EducatorsAdminController {
    constructor(educatorsService) {
        this.educatorsService = educatorsService;
    }
    create(body, user) {
        return this.educatorsService.create(body, user);
    }
    findAll(query, user) {
        return this.educatorsService.findAll(query, user);
    }
    findById(id, user) {
        return this.educatorsService.findById(id, user);
    }
    update(id, body, user) {
        return this.educatorsService.update(id, body, user);
    }
    delete(id, user) {
        return this.educatorsService.delete(id, user);
    }
};
exports.EducatorsAdminController = EducatorsAdminController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_educator_dto_1.CreateEducatorDto, Object]),
    __metadata("design:returntype", void 0)
], EducatorsAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_options_dto_1.QueryOptionsDto, Object]),
    __metadata("design:returntype", void 0)
], EducatorsAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EducatorsAdminController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(":id"),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], EducatorsAdminController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EducatorsAdminController.prototype, "delete", null);
exports.EducatorsAdminController = EducatorsAdminController = __decorate([
    (0, common_1.Controller)("admin/educators"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [educators_admin_service_1.EducatorsAdminService])
], EducatorsAdminController);
//# sourceMappingURL=educators.admin.controller.js.map