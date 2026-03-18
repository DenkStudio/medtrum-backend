import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { ClaimsAdminService } from "./claims.admin.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { ClaimsChartQueryDto } from "./dto/claims-chart-query.dto";
import { ClaimStatus } from "@prisma/client";
import { CurrentUser } from "../common/decorators/user.decorator";
import { AuthUser } from "../common/helpers/organization-filter.helper";

@Controller("admin/claims")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClaimsAdminController {
  constructor(private readonly service: ClaimsAdminService) {}

  @Get()
  @Roles("admin", "superadmin", "educator", "super_educator", "logistica")
  findAll(@Query() query: QueryOptionsDto, @CurrentUser() user: AuthUser) {
    return this.service.findAll(query, user);
  }

  @Get("chart")
  @Roles("admin", "superadmin", "educator", "super_educator")
  getChartData(@Query() query: ClaimsChartQueryDto, @CurrentUser() user: AuthUser) {
    return this.service.getChartData(query, user);
  }

  @Get("chart/by-user")
  @Roles("admin", "superadmin", "educator", "super_educator")
  getClaimsByUserChart(@Query() query: ClaimsChartQueryDto, @CurrentUser() user: AuthUser) {
    return this.service.getClaimsByUserChart(query, user);
  }

  @Get("export")
  @Roles("admin", "superadmin", "educator", "super_educator", "logistica")
  async export(@Query() query: QueryOptionsDto, @CurrentUser() user: AuthUser, @Res() res: Response) {
    const buffer = await this.service.exportExcel(query, user);
    res.set({
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=reclamos.xlsx",
    });
    res.end(buffer);
  }

  @Get(":claimId")
  @Roles("admin", "superadmin", "educator", "super_educator", "logistica")
  findOne(@Param("claimId") claimId: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(claimId, user);
  }

  @Get("user/:userId")
  @Roles("admin", "superadmin", "educator", "super_educator", "logistica")
  findByUserId(@Param("userId") userId: string, @CurrentUser() user: AuthUser) {
    return this.service.findByUserId(userId, user);
  }

  @Patch(":id/status")
  @Roles("admin", "superadmin", "educator", "super_educator", "logistica")
  setStatus(
    @Param("id") id: string,
    @Body() body: {
      status: ClaimStatus;
      resolutionMessage?: string;
    },
    @CurrentUser() user: AuthUser
  ) {
    return this.service.setStatus(
      id,
      body.status,
      body.resolutionMessage,
      user,
    );
  }

  @Patch(":id/reimburse")
  @Roles("admin", "superadmin", "logistica")
  reimburse(
    @Param("id") id: string,
    @Body() body: {
      qty: number;
      daysReimbursed?: number;
      resolutionMessage?: string;
      returnedLots?: { lotNumber: string; qty: number }[];
      reimbursementPhotoUrl?: string;
      trackingLink?: string;
      shippingDate?: string;
      deliveryPhotoUrl?: string;
    },
    @CurrentUser() user: AuthUser
  ) {
    return this.service.reimburse(
      id,
      body.qty,
      body.daysReimbursed,
      body.resolutionMessage,
      user,
      body.returnedLots,
      {
        reimbursementPhotoUrl: body.reimbursementPhotoUrl,
        trackingLink: body.trackingLink,
        shippingDate: body.shippingDate,
        deliveryPhotoUrl: body.deliveryPhotoUrl,
      },
    );
  }

  @Get(":id/reimbursement-photo-url")
  @Roles("admin", "superadmin", "logistica")
  getReimbursementPhotoUrl(@Param("id") id: string) {
    return this.service.getReimbursementPhotoSignedUrl(id);
  }

  @Patch(":id/observations")
  @Roles("admin", "superadmin", "educator", "super_educator", "logistica")
  addObservation(
    @Param("id") id: string,
    @Body() body: { text: string },
    @CurrentUser() user: AuthUser
  ) {
    return this.service.addObservation(id, body.text, user);
  }
}
