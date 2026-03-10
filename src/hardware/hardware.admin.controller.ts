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
  getChartByType(@CurrentUser() user: AuthUser) {
    return this.service.getChartByType(user);
  }

  @Get("chart/errors-by-product")
  @Roles("admin", "superadmin")
  getErrorsByProduct(@CurrentUser() user: AuthUser) {
    return this.service.getErrorsByProduct(user);
  }

  @Get("user/:userId")
  @Roles("admin", "superadmin")
  findByUserId(@Param("userId") userId: string) {
    return this.service.findByUserId(userId);
  }

  @Get(":id")
  @Roles("admin", "superadmin")
  findOne(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(id, user);
  }

  @Patch(":id")
  @Roles("admin", "superadmin")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateHardwareSupplyDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.service.update(id, dto, user);
  }

  @Post(":id/assign")
  @Roles("admin", "superadmin")
  assign(
    @Param("id") hardwareId: string,
    @Body()
    body: { userId: string; observations?: string },
    @CurrentUser() user: AuthUser
  ) {
    return this.service.assign(
      hardwareId,
      body.userId,
      user.userId,
      body.observations
    );
  }

  @Post(":id/return")
  @Roles("admin", "superadmin")
  returnHardware(
    @Param("id") hardwareId: string,
    @Body() body: { observations?: string },
    @CurrentUser() user: AuthUser
  ) {
    return this.service.returnHardware(
      hardwareId,
      user.userId,
      body.observations
    );
  }

  @Post(":id/transfer")
  @Roles("admin", "superadmin")
  transfer(
    @Param("id") hardwareId: string,
    @Body()
    body: { userId: string; observations?: string },
    @CurrentUser() user: AuthUser
  ) {
    return this.service.transfer(
      hardwareId,
      body.userId,
      user.userId,
      body.observations
    );
  }
}
