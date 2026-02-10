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
exports.DeliveriesAdminController = void 0;
const common_1 = require("@nestjs/common");
const deliveries_admin_service_1 = require("./deliveries.admin.service");
const create_delivery_dto_1 = require("./dto/create-delivery.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const query_options_dto_1 = require("../common/query/query-options.dto");
const user_decorator_1 = require("../common/decorators/user.decorator");
let DeliveriesAdminController = class DeliveriesAdminController {
    constructor(service) {
        this.service = service;
    }
    create(dto, user) {
        return this.service.create(dto, user.userId, user);
    }
    findAll(query, user) {
        return this.service.findAll(query, user);
    }
    findByUserId(userId, user) {
        return this.service.findByUserId(userId, user);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
};
exports.DeliveriesAdminController = DeliveriesAdminController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_delivery_dto_1.CreateDeliveryDto, Object]),
    __metadata("design:returntype", void 0)
], DeliveriesAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_options_dto_1.QueryOptionsDto, Object]),
    __metadata("design:returntype", void 0)
], DeliveriesAdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("user/:userId"),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DeliveriesAdminController.prototype, "findByUserId", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, roles_decorator_1.Roles)("admin", "superadmin"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeliveriesAdminController.prototype, "findOne", null);
exports.DeliveriesAdminController = DeliveriesAdminController = __decorate([
    (0, common_1.Controller)("admin/deliveries"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [deliveries_admin_service_1.DeliveriesAdminService])
], DeliveriesAdminController);
//# sourceMappingURL=deliveries.admin.controller.js.map