import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { ClaimsAdminService } from "./claims.admin.service";
import { CreateClaimDto } from "./dto/create-claim.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { CurrentUser } from "../common/decorators/user.decorator";
import { ClaimsService } from "./claims.service";

@Controller("claims")
@UseGuards(JwtAuthGuard, RolesGuard)
export class Claimsontroller {
  constructor(private readonly service: ClaimsService) {}

  @Post()
  @Roles("patient")
  create(@Body() dto: CreateClaimDto, @CurrentUser() user: { userId: string }) {
    console.log(user);
    return this.service.create(dto, user.userId);
  }

  @Get()
  @Roles("patient")
  findAll(
    @Query() query: QueryOptionsDto,
    @CurrentUser() user: { userId: string }
  ) {
    return this.service.findByUserId(user.userId, query);
  }

  @Get(":claimId")
  @Roles("patient")
  findOne(
    @Param("claimId") claimId: string,
    @CurrentUser() user: { userId: string }
  ) {
    return this.service.findOne(claimId, user.userId);
  }
}
