import { Module } from "@nestjs/common";
import { EducatorsAdminService } from "./educators.admin.service";
import { EducatorsAdminController } from "./educators.admin.controller";
import { EducatorsService } from "./educators.service";
import { EducatorsController } from "./educators.controller";

@Module({
  providers: [EducatorsAdminService, EducatorsService],
  controllers: [EducatorsAdminController, EducatorsController],
  exports: [EducatorsAdminService, EducatorsService],
})
export class EducatorsModule {}
