"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimsModule = void 0;
const common_1 = require("@nestjs/common");
const claims_admin_service_1 = require("./claims.admin.service");
const claims_admin_controller_1 = require("./claims.admin.controller");
const users_module_1 = require("../users/users.module");
const claims_controller_1 = require("./claims.controller");
const claims_service_1 = require("./claims.service");
const deliveries_module_1 = require("../deliveries/deliveries.module");
let ClaimsModule = class ClaimsModule {
};
exports.ClaimsModule = ClaimsModule;
exports.ClaimsModule = ClaimsModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule, deliveries_module_1.DeliveriesModule],
        providers: [claims_admin_service_1.ClaimsAdminService, claims_service_1.ClaimsService],
        controllers: [claims_admin_controller_1.ClaimsAdminController, claims_controller_1.Claimsontroller],
    })
], ClaimsModule);
//# sourceMappingURL=claims.module.js.map