import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { HealthcareAdminService } from "./healthcare.admin.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CreateHealthcareDto } from "./dto/create-healthcare.dto";
import { CurrentUser } from "../common/decorators/user.decorator";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { QueryOptionsDto } from "src/common/query/query-options.dto";

@Controller("admin/healthcare")
@UseGuards(JwtAuthGuard, RolesGuard)
export class HealthcareAdminController {
  constructor(private readonly healthcareService: HealthcareAdminService) {}

  @Post()
  @Roles("superadmin", "admin")
  create(@Body() body: CreateHealthcareDto, @CurrentUser() user: AuthUser) {
    return this.healthcareService.create(body, user);
  }

  @Get()
  @Roles("admin", "superadmin")
  findAll(@Query() query: QueryOptionsDto, @CurrentUser() user: AuthUser) {
    return this.healthcareService.findAll(query, user);
  }
}
