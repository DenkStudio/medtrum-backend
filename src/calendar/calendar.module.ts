import { Module } from "@nestjs/common";
import { CalendarAdminService } from "./calendar.admin.service";
import { CalendarAdminController } from "./calendar.admin.controller";

@Module({
  providers: [CalendarAdminService],
  controllers: [CalendarAdminController],
  exports: [CalendarAdminService],
})
export class CalendarModule {}
