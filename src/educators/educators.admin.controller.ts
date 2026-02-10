import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { EducatorsAdminService } from "./educators.admin.service";
import { CreateEducatorDto } from "./dto/create-educator.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { QueryOptionsDto } from "src/common/query/query-options.dto";

@Controller("admin/educators")
@UseGuards(JwtAuthGuard, RolesGuard)
export class EducatorsAdminController {
  constructor(private readonly educatorsService: EducatorsAdminService) {}

  @Post()
  @Roles("admin", "superadmin")
  create(@Body() body: CreateEducatorDto, @CurrentUser() user: AuthUser) {
    return this.educatorsService.create(body, user);
  }

  @Get()
  @Roles("admin", "superadmin")
  findAll(@Query() query: QueryOptionsDto, @CurrentUser() user: AuthUser) {
    return this.educatorsService.findAll(query, user);
  }

  @Get(":id")
  @Roles("admin", "superadmin")
  findById(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.educatorsService.findById(id, user);
  }

  @Put(":id")
  @Roles("admin", "superadmin")
  update(
    @Param("id") id: string,
    @Body() body: Partial<CreateEducatorDto>,
    @CurrentUser() user: AuthUser
  ) {
    return this.educatorsService.update(id, body, user);
  }

  @Delete(":id")
  @Roles("admin", "superadmin")
  delete(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.educatorsService.delete(id, user);
  }
}
