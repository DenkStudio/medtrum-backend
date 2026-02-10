import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { EducatorsService } from "./educators.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { QueryOptionsDto } from "src/common/query/query-options.dto";

@Controller("educator")
@UseGuards(JwtAuthGuard, RolesGuard)
export class EducatorsController {
  constructor(private readonly educatorsService: EducatorsService) {}

  @Get("patients")
  @Roles("educator")
  findMyPatients(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryOptionsDto
  ) {
    if (!user.educatorId) {
      throw new ForbiddenException("No educator profile linked");
    }
    return this.educatorsService.findMyPatients(user.educatorId, query);
  }

  @Get("patients/:id")
  @Roles("educator")
  findMyPatientById(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string
  ) {
    if (!user.educatorId) {
      throw new ForbiddenException("No educator profile linked");
    }
    return this.educatorsService.findMyPatientById(user.educatorId, id);
  }

  @Patch("patients/:id")
  @Roles("educator")
  updateMyPatient(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: UpdatePatientDto
  ) {
    if (!user.educatorId) {
      throw new ForbiddenException("No educator profile linked");
    }
    return this.educatorsService.updateMyPatient(user.educatorId, id, dto);
  }
}
