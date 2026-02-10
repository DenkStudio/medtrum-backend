import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { OrganizationsAdminService } from "./organizations.admin.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { OrganizationName } from "@prisma/client";

@Controller("admin/organizations")
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsAdminController {
  constructor(private readonly orgs: OrganizationsAdminService) {}

  @Post()
  @Roles("superadmin")
  create(@Body() body: { name: OrganizationName; code: string }) {
    return this.orgs.create(body);
  }

  @Get()
  @Roles("admin", "superadmin")
  findAll(@Query() query: QueryOptionsDto) {
    return this.orgs.findAll(query);
  }
}
