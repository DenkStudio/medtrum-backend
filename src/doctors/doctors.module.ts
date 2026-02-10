import { Module } from "@nestjs/common";
import { DoctorsAdminService } from "./doctors.admin.service";
import { DoctorsAdminController } from "./doctors.admin.controller";

@Module({
  providers: [DoctorsAdminService],
  controllers: [DoctorsAdminController],
  exports: [DoctorsAdminService],
})
export class DoctorsModule {}
