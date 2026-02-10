"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalEntriesModule = void 0;
const common_1 = require("@nestjs/common");
const medical_entries_admin_service_1 = require("./medical-entries.admin.service");
const medical_entries_admin_controller_1 = require("./medical-entries.admin.controller");
const medical_entries_service_1 = require("./medical-entries.service");
const medical_entries_controller_1 = require("./medical-entries.controller");
const medical_entries_educator_service_1 = require("./medical-entries-educator.service");
const medical_entries_educator_controller_1 = require("./medical-entries-educator.controller");
let MedicalEntriesModule = class MedicalEntriesModule {
};
exports.MedicalEntriesModule = MedicalEntriesModule;
exports.MedicalEntriesModule = MedicalEntriesModule = __decorate([
    (0, common_1.Module)({
        providers: [medical_entries_admin_service_1.MedicalEntriesAdminService, medical_entries_service_1.MedicalEntriesService, medical_entries_educator_service_1.MedicalEntriesEducatorService],
        controllers: [medical_entries_admin_controller_1.MedicalEntriesAdminController, medical_entries_controller_1.MedicalEntriesController, medical_entries_educator_controller_1.MedicalEntriesEducatorController],
    })
], MedicalEntriesModule);
//# sourceMappingURL=medical-entries.module.js.map