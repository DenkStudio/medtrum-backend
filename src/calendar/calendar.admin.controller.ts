import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CalendarAdminService } from "./calendar.admin.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { CalendarQueryDto } from "./dto/calendar-query.dto";
import { CreateCalendarEventDto } from "./dto/create-calendar-event.dto";

@Controller("admin/calendar")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalendarAdminController {
  constructor(private readonly service: CalendarAdminService) {}

  @Get()
  @Roles("admin", "superadmin", "educator", "super_educator")
  findAll(@Query() query: CalendarQueryDto, @CurrentUser() user: AuthUser) {
    return this.service.findAll(query, user);
  }

  @Post()
  @Roles("admin", "superadmin", "educator", "super_educator")
  create(@Body() dto: CreateCalendarEventDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user);
  }

  @Delete(":id")
  @Roles("admin", "superadmin", "educator", "super_educator")
  remove(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.service.remove(id, user);
  }
}
