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
exports.EducatorsController = void 0;
const common_1 = require("@nestjs/common");
const educators_service_1 = require("./educators.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_decorator_1 = require("../common/decorators/user.decorator");
const update_patient_dto_1 = require("./dto/update-patient.dto");
const query_options_dto_1 = require("../common/query/query-options.dto");
let EducatorsController = class EducatorsController {
    constructor(educatorsService) {
        this.educatorsService = educatorsService;
    }
    findMyPatients(user, query) {
        if (!user.educatorId) {
            throw new common_1.ForbiddenException("No educator profile linked");
        }
        return this.educatorsService.findMyPatients(user.educatorId, query);
    }
    findMyPatientById(user, id) {
        if (!user.educatorId) {
            throw new common_1.ForbiddenException("No educator profile linked");
        }
        return this.educatorsService.findMyPatientById(user.educatorId, id);
    }
    updateMyPatient(user, id, dto) {
        if (!user.educatorId) {
            throw new common_1.ForbiddenException("No educator profile linked");
        }
        return this.educatorsService.updateMyPatient(user.educatorId, id, dto);
    }
};
exports.EducatorsController = EducatorsController;
__decorate([
    (0, common_1.Get)("patients"),
    (0, roles_decorator_1.Roles)("educator"),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_options_dto_1.QueryOptionsDto]),
    __metadata("design:returntype", void 0)
], EducatorsController.prototype, "findMyPatients", null);
__decorate([
    (0, common_1.Get)("patients/:id"),
    (0, roles_decorator_1.Roles)("educator"),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], EducatorsController.prototype, "findMyPatientById", null);
__decorate([
    (0, common_1.Patch)("patients/:id"),
    (0, roles_decorator_1.Roles)("educator"),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_patient_dto_1.UpdatePatientDto]),
    __metadata("design:returntype", void 0)
], EducatorsController.prototype, "updateMyPatient", null);
exports.EducatorsController = EducatorsController = __decorate([
    (0, common_1.Controller)("educator"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [educators_service_1.EducatorsService])
], EducatorsController);
//# sourceMappingURL=educators.controller.js.map