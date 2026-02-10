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
exports.Claimsontroller = void 0;
const common_1 = require("@nestjs/common");
const create_claim_dto_1 = require("./dto/create-claim.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const query_options_dto_1 = require("../common/query/query-options.dto");
const user_decorator_1 = require("../common/decorators/user.decorator");
const claims_service_1 = require("./claims.service");
let Claimsontroller = class Claimsontroller {
    constructor(service) {
        this.service = service;
    }
    create(dto, user) {
        console.log(user);
        return this.service.create(dto, user.userId);
    }
    findAll(query, user) {
        return this.service.findByUserId(user.userId, query);
    }
    findOne(claimId, user) {
        return this.service.findOne(claimId, user.userId);
    }
};
exports.Claimsontroller = Claimsontroller;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)("patient"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_claim_dto_1.CreateClaimDto, Object]),
    __metadata("design:returntype", void 0)
], Claimsontroller.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)("patient"),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_options_dto_1.QueryOptionsDto, Object]),
    __metadata("design:returntype", void 0)
], Claimsontroller.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":claimId"),
    (0, roles_decorator_1.Roles)("patient"),
    __param(0, (0, common_1.Param)("claimId")),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], Claimsontroller.prototype, "findOne", null);
exports.Claimsontroller = Claimsontroller = __decorate([
    (0, common_1.Controller)("claims"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [claims_service_1.ClaimsService])
], Claimsontroller);
//# sourceMappingURL=claims.controller.js.map