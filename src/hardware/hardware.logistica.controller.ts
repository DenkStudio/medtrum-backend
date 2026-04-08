import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { HardwareAdminService } from "./hardware.admin.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { CurrentUser } from "../common/decorators/user.decorator";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { UpdateHardwareLogisticaDto } from "./dto/update-hardware-logistica.dto";

@Controller("logistica/hardware")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("logistica", "superadmin", "admin", "educator", "super_educator")
export class HardwareLogisticaController {
  constructor(private readonly service: HardwareAdminService) {}

  @Get()
  findIncomplete(
    @Query() query: QueryOptionsDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.findIncomplete(query, user);
  }

  @Patch(":id")
  updateFields(
    @Param("id") id: string,
    @Body() dto: UpdateHardwareLogisticaDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.updateLogisticaFields(id, dto, user);
  }
}
