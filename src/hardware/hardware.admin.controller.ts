import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
import { UpdateHardwareSupplyDto } from "./dto/update-hardware-supply.dto";
import { CreateHardwareSupplyDto } from "./dto/create-hardware-supply.dto";

@Controller("admin/hardware")
@UseGuards(JwtAuthGuard, RolesGuard)
export class HardwareAdminController {
  constructor(private readonly service: HardwareAdminService) {}

  @Post()
  @Roles("admin", "superadmin")
  create(@Body() dto: CreateHardwareSupplyDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.userId, user.orgId);
  }

  @Get()
  @Roles("admin", "superadmin")
  findAll(@Query() query: QueryOptionsDto, @CurrentUser() user: AuthUser) {
    return this.service.findAll(query, user);
  }

  @Get("chart/by-type")
  @Roles("admin", "superadmin")
  getChartByType(
    @Query("organizationId") organizationId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.getChartByType(user, organizationId, startDate, endDate);
  }

  @Get("chart/errors")
  @Roles("admin", "superadmin")
  getErrorsByProduct(
    @Query("organizationId") organizationId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.getErrorsByProduct(user, organizationId, startDate, endDate);
  }

  @Get("user/:userId")
  @Roles("admin", "superadmin")
  findByUserId(@Param("userId") userId: string, @CurrentUser() user: AuthUser) {
    return this.service.findByUserId(userId, user);
  }

  @Get(":id")
  @Roles("admin", "superadmin", "educator", "super_educator")
  findOne(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(id, user);
  }

  @Patch(":id")
  @Roles("admin", "superadmin", "educator", "super_educator")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateHardwareSupplyDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.service.update(id, dto, user);
  }

}
