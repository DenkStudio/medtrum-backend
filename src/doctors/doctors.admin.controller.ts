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
import { DoctorsAdminService } from "./doctors.admin.service";
import { CreateDoctorDto } from "./dto/create-doctor.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { QueryOptionsDto } from "src/common/query/query-options.dto";

@Controller("admin/doctors")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsAdminController {
  constructor(private readonly doctorsService: DoctorsAdminService) {}

  @Post()
  @Roles("admin", "superadmin")
  create(@Body() body: CreateDoctorDto, @CurrentUser() user: AuthUser) {
    return this.doctorsService.create(body, user);
  }

  @Get()
  @Roles("admin", "superadmin")
  findAll(@Query() query: QueryOptionsDto, @CurrentUser() user: AuthUser) {
    return this.doctorsService.findAll(query, user);
  }

  @Get(":id")
  @Roles("admin", "superadmin")
  findById(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.doctorsService.findById(id, user);
  }

  @Put(":id")
  @Roles("admin", "superadmin")
  update(
    @Param("id") id: string,
    @Body() body: Partial<CreateDoctorDto>,
    @CurrentUser() user: AuthUser
  ) {
    return this.doctorsService.update(id, body, user);
  }

  @Delete(":id")
  @Roles("admin", "superadmin")
  delete(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.doctorsService.delete(id, user);
  }
}
