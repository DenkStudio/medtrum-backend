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
  @Roles("educator")
  create(
    @Body() dto: CreateMedicalEntryDto,
    @CurrentUser() user: AuthUser
  ) {
    if (!user.educatorId) {
      throw new ForbiddenException("No educator profile linked");
    }
    return this.service.create(user.educatorId, user.userId, dto);
  }

  @Get("patient/:patientId")
  @Roles("educator")
  findByPatientId(
    @Param("patientId") patientId: string,
    @Query() query: QueryOptionsDto,
    @CurrentUser() user: AuthUser
  ) {
    if (!user.educatorId) {
      throw new ForbiddenException("No educator profile linked");
    }
    return this.service.findByPatientId(user.educatorId, patientId, query);
  }

  @Get(":id")
  @Roles("educator")
  findOne(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser
  ) {
    if (!user.educatorId) {
      throw new ForbiddenException("No educator profile linked");
    }
    return this.service.findOne(user.educatorId, id);
  }
}
