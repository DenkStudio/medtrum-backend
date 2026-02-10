import { Module, forwardRef } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { UsersAdminController } from "./users.admin.controller";
import { UsersAdminService } from "./users.admin.service";
import { AdminsAdminController } from "./admins.admin.controller";
import { AdminsAdminService } from "./admins.admin.service";
import { HardwareModule } from "../hardware/hardware.module";
import { ExcelExportService } from "../utils/excel-export.service";

@Module({
  imports: [forwardRef(() => HardwareModule)],
  controllers: [UsersController, UsersAdminController, AdminsAdminController],
  providers: [UsersService, UsersAdminService, AdminsAdminService, ExcelExportService],
  exports: [UsersService, UsersAdminService, AdminsAdminService],
})
export class UsersModule {}
