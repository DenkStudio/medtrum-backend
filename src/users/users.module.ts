import { Module, forwardRef } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { UsersAdminController } from "./users.admin.controller";
import { UsersAdminService } from "./users.admin.service";
import { AdminsAdminController } from "./admins.admin.controller";
import { AdminsAdminService } from "./admins.admin.service";
import { LogisticaAdminController } from "./logistica.admin.controller";
import { LogisticaAdminService } from "./logistica.admin.service";
import { SuperEducatorsAdminController } from "./super-educators.admin.controller";
import { SuperEducatorsAdminService } from "./super-educators.admin.service";
import { HardwareModule } from "../hardware/hardware.module";
import { ExcelExportService } from "../utils/excel-export.service";

@Module({
  imports: [forwardRef(() => HardwareModule)],
  controllers: [UsersController, UsersAdminController, AdminsAdminController, LogisticaAdminController, SuperEducatorsAdminController],
  providers: [UsersService, UsersAdminService, AdminsAdminService, LogisticaAdminService, SuperEducatorsAdminService, ExcelExportService],
  exports: [UsersService, UsersAdminService, AdminsAdminService, LogisticaAdminService, SuperEducatorsAdminService],
})
export class UsersModule {}
