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
import { LogisticaAdminService } from "./logistica.admin.service";
import { CreateLogisticaDto } from "./dto/create-logistica.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { QueryOptionsDto } from "src/common/query/query-options.dto";

@Controller("admin/logistica")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("superadmin", "admin")
export class LogisticaAdminController {
  constructor(private readonly service: LogisticaAdminService) {}

  @Post()
  create(@Body() dto: CreateLogisticaDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user);
  }

  @Get()
  findAll(@Query() query: QueryOptionsDto, @CurrentUser() user: AuthUser) {
    return this.service.findAll(query, user);
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.service.findById(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: Partial<CreateLogisticaDto>) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  @Roles("superadmin")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
