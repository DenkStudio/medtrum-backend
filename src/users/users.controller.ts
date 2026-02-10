import {
  Controller,
  Get,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "src/common/decorators/user.decorator";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles("patient")
  findMyProfile(
    @CurrentUser()
    user: {
      userId: string;
      role: "patient" | "admin" | "superadmin";
      patientId?: string;
    }
  ) {
    return this.usersService.findMyProfile(user.userId);
  }
}
