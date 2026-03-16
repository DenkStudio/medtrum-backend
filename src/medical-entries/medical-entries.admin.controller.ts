import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { MedicalEntriesAdminService } from "./medical-entries.admin.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { QueryOptionsDto } from "src/common/query/query-options.dto";

@Controller("admin/medical-entries")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalEntriesAdminController {
  constructor(private readonly service: MedicalEntriesAdminService) {}

  @Get("patient/:patientId")
  @Roles("admin", "superadmin")
  findByPatientId(
    @Param("patientId") patientId: string,
    @Query() query: QueryOptionsDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.findByPatientId(patientId, query, user);
  }

  @Get(":id")
  @Roles("admin", "superadmin")
  findOne(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(id, user);
  }
}
