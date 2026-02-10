import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { MedicalEntriesService } from "./medical-entries.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { QueryOptionsDto } from "src/common/query/query-options.dto";

@Controller("medical-entries")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalEntriesController {
  constructor(private readonly service: MedicalEntriesService) {}

  @Get()
  @Roles("patient")
  findMyEntries(
    @CurrentUser() user: { userId: string },
    @Query() query: QueryOptionsDto
  ) {
    return this.service.findMyEntries(user.userId, query);
  }
}
