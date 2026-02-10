import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminsAdminService } from "./admins.admin.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { QueryOptionsDto } from "src/common/query/query-options.dto";

@Controller("admin/admins")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("superadmin")
export class AdminsAdminController {
  constructor(private readonly adminsService: AdminsAdminService) {}

  @Post()
  create(@Body() dto: CreateAdminDto, @CurrentUser() user: AuthUser) {
    return this.adminsService.create(dto, user);
  }

  @Get()
  findAll(@Query() query: QueryOptionsDto, @CurrentUser() user: AuthUser) {
    return this.adminsService.findAll(query, user);
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.adminsService.findById(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: Partial<CreateAdminDto>) {
    return this.adminsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.adminsService.remove(id);
  }
}
