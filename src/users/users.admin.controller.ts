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
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { UsersAdminService } from "./users.admin.service";
import { CurrentUser } from "../common/decorators/user.decorator";
import { ExcelExportService } from "../utils/excel-export.service";
import { AuthUser } from "../common/helpers/organization-filter.helper";

@Controller("admin/users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersAdminController {
  constructor(
    private readonly usersAdminService: UsersAdminService,
    private readonly excelExportService: ExcelExportService
  ) {}

  @Post()
  @Roles("superadmin", "admin", "educator", "super_educator")
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.usersAdminService.create(dto, user.userId);
  }

  @Post(":id/invite")
  @Roles("superadmin", "admin")
  invite(@Param("id") id: string) {
    return this.usersAdminService.invite(id);
  }

  @Patch(":id")
  @Roles("superadmin", "admin")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersAdminService.update(id, dto, user);
  }

  @Get()
  @Roles("superadmin", "admin")
  findAll(@Query() query: QueryOptionsDto, @CurrentUser() user: AuthUser) {
    return this.usersAdminService.findAll(query, user);
  }

  @Get("patients-overview")
  @Roles("superadmin", "admin", "educator", "super_educator")
  patientsOverview(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("organizationId") organizationId?: string,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.usersAdminService.patientsOverview(user!, startDate, endDate, organizationId);
  }

  @Get("export")
  @Roles("superadmin", "admin")
  async exportUsersWithClaims(
    @Query() query: QueryOptionsDto,
    @CurrentUser() user: AuthUser
  ) {
    const users = await this.usersAdminService.getUsers(user, query);
    return this.excelExportService.exportUsers(users);
  }

  @Get(":id")
  @Roles("superadmin", "admin", "educator", "super_educator")
  findById(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.usersAdminService.findById(id, user);
  }

  @Delete(":id")
  @Roles("superadmin")
  remove(@Param("id") id: string) {
    return this.usersAdminService.remove(id);
  }
}
