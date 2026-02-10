import { Module } from "@nestjs/common";
import { HealthcareAdminService } from "./healthcare.admin.service";
import { HealthcareAdminController } from "./healthcare.admin.controller";

@Module({
  providers: [HealthcareAdminService],
  controllers: [HealthcareAdminController],
  exports: [HealthcareAdminService],
})
export class HealthcareModule {}
