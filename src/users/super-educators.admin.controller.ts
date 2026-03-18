import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { SuperEducatorsAdminService } from "./super-educators.admin.service";
import { CreateSuperEducatorDto } from "./dto/create-super-educator.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { QueryOptionsDto } from "src/common/query/query-options.dto";

@Controller("admin/super-educators")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("superadmin")
export class SuperEducatorsAdminController {
  constructor(
    private readonly superEducatorsService: SuperEducatorsAdminService,
  ) {}

  @Post()
  create(@Body() dto: CreateSuperEducatorDto) {
    return this.superEducatorsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryOptionsDto) {
    return this.superEducatorsService.findAll(query);
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.superEducatorsService.findById(id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.superEducatorsService.remove(id);
  }
}
