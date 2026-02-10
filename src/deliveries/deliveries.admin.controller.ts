import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { DeliveriesAdminService } from "./deliveries.admin.service";
import { CreateDeliveryDto } from "./dto/create-delivery.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { CurrentUser } from "../common/decorators/user.decorator";
import { AuthUser } from "../common/helpers/organization-filter.helper";

@Controller("admin/deliveries")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveriesAdminController {
  constructor(private readonly service: DeliveriesAdminService) {}

  @Post()
  @Roles("admin", "superadmin")
  create(@Body() dto: CreateDeliveryDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.userId, user);
  }

  @Get()
  @Roles("admin", "superadmin")
  findAll(@Query() query: QueryOptionsDto, @CurrentUser() user: AuthUser) {
    return this.service.findAll(query, user);
  }

  @Get("user/:userId")
  @Roles("admin", "superadmin")
  findByUserId(
    @Param("userId") userId: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.service.findByUserId(userId, user);
  }

  @Get(":id")
  @Roles("admin", "superadmin")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }
}
