"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const organizations_module_1 = require("./organizations/organizations.module");
const hardware_module_1 = require("./hardware/hardware.module");
const claims_module_1 = require("./claims/claims.module");
const healthcare_module_1 = require("./healthcare/healthcare.module");
const doctors_module_1 = require("./doctors/doctors.module");
const medical_entries_module_1 = require("./medical-entries/medical-entries.module");
const educators_module_1 = require("./educators/educators.module");
const supabase_module_1 = require("./supabase/supabase.module");
const deliveries_module_1 = require("./deliveries/deliveries.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            supabase_module_1.SupabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            organizations_module_1.OrganizationsModule,
            hardware_module_1.HardwareModule,
            claims_module_1.ClaimsModule,
            healthcare_module_1.HealthcareModule,
            doctors_module_1.DoctorsModule,
            medical_entries_module_1.MedicalEntriesModule,
            educators_module_1.EducatorsModule,
            deliveries_module_1.DeliveriesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map