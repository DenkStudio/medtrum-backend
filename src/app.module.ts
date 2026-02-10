import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { OrganizationsModule } from "./organizations/organizations.module";

import { HardwareModule } from "./hardware/hardware.module";
import { ClaimsModule } from "./claims/claims.module";
import { HealthcareModule } from "./healthcare/healthcare.module";
import { DoctorsModule } from "./doctors/doctors.module";
import { MedicalEntriesModule } from "./medical-entries/medical-entries.module";
import { EducatorsModule } from "./educators/educators.module";
import { SupabaseModule } from "./supabase/supabase.module";
import { DeliveriesModule } from "./deliveries/deliveries.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SupabaseModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,

    HardwareModule,
    ClaimsModule,
    HealthcareModule,
    DoctorsModule,
    MedicalEntriesModule,
    EducatorsModule,
    DeliveriesModule,
  ],
})
export class AppModule {}
