import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { LocalidadesAdminService } from "./localidades.admin.service";
import { CreateLocalidadDto } from "./dto/create-localidad.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { AuthUser } from "../common/helpers/organization-filter.helper";

@Controller("admin/localidades")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LocalidadesAdminController {
  constructor(
    private readonly localidadesService: LocalidadesAdminService,
  ) {}

  @Post()
  @Roles("superadmin", "admin")
  create(@Body() body: CreateLocalidadDto, @CurrentUser() user: AuthUser) {
    return this.localidadesService.create(body, user);
  }

  @Get()
  @Roles("admin", "superadmin", "educator", "super_educator")
  findAll(
    @Query("province") province: string,
    @CurrentUser() user: AuthUser,
  ) {
    if (province) {
      return this.localidadesService.findByProvince(province, user);
    }
    return this.localidadesService.findAll(user);
  }
}
