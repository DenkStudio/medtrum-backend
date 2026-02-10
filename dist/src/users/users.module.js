"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const users_controller_1 = require("./users.controller");
const users_admin_controller_1 = require("./users.admin.controller");
const users_admin_service_1 = require("./users.admin.service");
const admins_admin_controller_1 = require("./admins.admin.controller");
const admins_admin_service_1 = require("./admins.admin.service");
const hardware_module_1 = require("../hardware/hardware.module");
const excel_export_service_1 = require("../utils/excel-export.service");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => hardware_module_1.HardwareModule)],
        controllers: [users_controller_1.UsersController, users_admin_controller_1.UsersAdminController, admins_admin_controller_1.AdminsAdminController],
        providers: [users_service_1.UsersService, users_admin_service_1.UsersAdminService, admins_admin_service_1.AdminsAdminService, excel_export_service_1.ExcelExportService],
        exports: [users_service_1.UsersService, users_admin_service_1.UsersAdminService, admins_admin_service_1.AdminsAdminService],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map