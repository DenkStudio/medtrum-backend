import {
  Controller,
  Get,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { HardwareService } from "./hardware.service";

@Controller("hardware")
@UseGuards(JwtAuthGuard, RolesGuard)
export class HardwareController {
  constructor(private readonly service: HardwareService) {}

  @Get("")
  @Roles("patient")
  findMyHardware(
    @CurrentUser()
    user: {
      userId: string;
      role: "patient" | "admin" | "superadmin";
      patientId?: string;
    }
  ) {
    return this.service.findByUserId(user.userId);
  }
}
