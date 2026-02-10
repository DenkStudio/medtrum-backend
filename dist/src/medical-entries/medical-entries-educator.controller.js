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
exports.MedicalEntriesEducatorController = void 0;
const common_1 = require("@nestjs/common");
const medical_entries_educator_service_1 = require("./medical-entries-educator.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_decorator_1 = require("../common/decorators/user.decorator");
const create_medical_entry_dto_1 = require("./dto/create-medical-entry.dto");
const query_options_dto_1 = require("../common/query/query-options.dto");
let MedicalEntriesEducatorController = class MedicalEntriesEducatorController {
    constructor(service) {
        this.service = service;
    }
    create(dto, user) {
        if (!user.educatorId) {
            throw new common_1.ForbiddenException("No educator profile linked");
        }
        return this.service.create(user.educatorId, user.userId, dto);
    }
    findByPatientId(patientId, query, user) {
        if (!user.educatorId) {
            throw new common_1.ForbiddenException("No educator profile linked");
        }
        return this.service.findByPatientId(user.educatorId, patientId, query);
    }
    findOne(id, user) {
        if (!user.educatorId) {
            throw new common_1.ForbiddenException("No educator profile linked");
        }
        return this.service.findOne(user.educatorId, id);
    }
};
exports.MedicalEntriesEducatorController = MedicalEntriesEducatorController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)("educator"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_medical_entry_dto_1.CreateMedicalEntryDto, Object]),
    __metadata("design:returntype", void 0)
], MedicalEntriesEducatorController.prototype, "create", null);
__decorate([
    (0, common_1.Get)("patient/:patientId"),
    (0, roles_decorator_1.Roles)("educator"),
    __param(0, (0, common_1.Param)("patientId")),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_options_dto_1.QueryOptionsDto, Object]),
    __metadata("design:returntype", void 0)
], MedicalEntriesEducatorController.prototype, "findByPatientId", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, roles_decorator_1.Roles)("educator"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MedicalEntriesEducatorController.prototype, "findOne", null);
exports.MedicalEntriesEducatorController = MedicalEntriesEducatorController = __decorate([
    (0, common_1.Controller)("educator/medical-entries"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [medical_entries_educator_service_1.MedicalEntriesEducatorService])
], MedicalEntriesEducatorController);
//# sourceMappingURL=medical-entries-educator.controller.js.map