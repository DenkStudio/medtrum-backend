import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { MedicalEntriesEducatorService } from "./medical-entries-educator.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { CreateMedicalEntryDto } from "./dto/create-medical-entry.dto";
import { QueryOptionsDto } from "src/common/query/query-options.dto";

@Controller("educator/medical-entries")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalEntriesEducatorController {
  constructor(private readonly service: MedicalEntriesEducatorService) {}

  @Post()
  @Roles("educator", "super_educator")
  create(
    @Body() dto: CreateMedicalEntryDto,
    @CurrentUser() user: AuthUser
  ) {
    if (!user.educatorId) {
      throw new ForbiddenException("No educator profile linked");
    }
    return this.service.create(user, dto);
  }

  @Get("patient/:patientId")
  @Roles("educator", "super_educator")
  findByPatientId(
    @Param("patientId") patientId: string,
    @Query() query: QueryOptionsDto,
    @CurrentUser() user: AuthUser
  ) {
    if (!user.educatorId) {
      throw new ForbiddenException("No educator profile linked");
    }
    return this.service.findByPatientId(user, patientId, query);
  }

  @Get(":id")
  @Roles("educator", "super_educator")
  findOne(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser
  ) {
    if (!user.educatorId) {
      throw new ForbiddenException("No educator profile linked");
    }
    return this.service.findOne(user, id);
  }
}
