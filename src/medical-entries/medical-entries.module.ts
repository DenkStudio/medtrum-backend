import { Module } from "@nestjs/common";
import { MedicalEntriesAdminService } from "./medical-entries.admin.service";
import { MedicalEntriesAdminController } from "./medical-entries.admin.controller";
import { MedicalEntriesService } from "./medical-entries.service";
import { MedicalEntriesController } from "./medical-entries.controller";
import { MedicalEntriesEducatorService } from "./medical-entries-educator.service";
import { MedicalEntriesEducatorController } from "./medical-entries-educator.controller";

@Module({
  providers: [MedicalEntriesAdminService, MedicalEntriesService, MedicalEntriesEducatorService],
  controllers: [MedicalEntriesAdminController, MedicalEntriesController, MedicalEntriesEducatorController],
})
export class MedicalEntriesModule {}
