import { Module } from "@nestjs/common";
import { HardwareAdminService } from "./hardware.admin.service";
import { HardwareAdminController } from "./hardware.admin.controller";
import { HardwareController } from "./hardware.controller";
import { HardwareService } from "./hardware.service";

@Module({
  providers: [HardwareAdminService, HardwareService],
  controllers: [HardwareAdminController, HardwareController],
  exports: [HardwareAdminService, HardwareService],
})
export class HardwareModule {}
