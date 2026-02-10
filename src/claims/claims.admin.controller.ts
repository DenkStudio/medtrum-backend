import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ClaimsAdminService } from "./claims.admin.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { ClaimStatus } from "@prisma/client";
import { CurrentUser } from "../common/decorators/user.decorator";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { ClaimsChartQueryDto } from "./dto/claims-chart-query.dto";

@Controller("admin/claims")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClaimsAdminController {
  constructor(private readonly service: ClaimsAdminService) {}

  @Get()
  @Roles("admin", "superadmin", "educator")
  findAll(@Query() query: QueryOptionsDto, @CurrentUser() user: AuthUser) {
    return this.service.findAll(query, user);
  }

  @Get("chart")
  @Roles("admin", "superadmin", "educator")
  getChartData(
    @Query() query: ClaimsChartQueryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.getChartData(query, user);
  }

  @Get("chart/by-user")
  @Roles("admin", "superadmin", "educator")
  getClaimsByUserChart(
    @Query() query: ClaimsChartQueryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.getClaimsByUserChart(query, user);
  }

  @Get(":claimId")
  @Roles("admin", "superadmin", "educator")
  findOne(@Param("claimId") claimId: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(claimId, user);
  }

  @Get("user/:userId")
  @Roles("admin", "superadmin", "educator")
  findByUserId(@Param("userId") userId: string, @CurrentUser() user: AuthUser) {
    return this.service.findByUserId(userId, user);
  }

  @Patch(":id/status")
  @Roles("admin", "superadmin")
  setStatus(
    @Param("id") id: string,
    @Body() body: {
      status: ClaimStatus;
      qty: number;
      daysReimbursed?: number;
      resolutionMessage?: string;
    },
    @CurrentUser() user: AuthUser
  ) {
    return this.service.setStatus(
      id,
      body.status,
      body.qty,
      body.daysReimbursed,
      body.resolutionMessage,
      user
    );
  }
}
