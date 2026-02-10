"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EducatorsModule = void 0;
const common_1 = require("@nestjs/common");
const educators_admin_service_1 = require("./educators.admin.service");
const educators_admin_controller_1 = require("./educators.admin.controller");
const educators_service_1 = require("./educators.service");
const educators_controller_1 = require("./educators.controller");
let EducatorsModule = class EducatorsModule {
};
exports.EducatorsModule = EducatorsModule;
exports.EducatorsModule = EducatorsModule = __decorate([
    (0, common_1.Module)({
        providers: [educators_admin_service_1.EducatorsAdminService, educators_service_1.EducatorsService],
        controllers: [educators_admin_controller_1.EducatorsAdminController, educators_controller_1.EducatorsController],
        exports: [educators_admin_service_1.EducatorsAdminService, educators_service_1.EducatorsService],
    })
], EducatorsModule);
//# sourceMappingURL=educators.module.js.map