import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { DeliveriesService } from "./deliveries.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";

@Controller("deliveries")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveriesController {
  constructor(private readonly service: DeliveriesService) {}

  @Get("unreceived")
  @Roles("patient")
  findUnreceived(@CurrentUser() user: { userId: string }) {
    return this.service.findUnreceivedReimbursements(user.userId);
  }

  @Get(":id/photo-url")
  @Roles("patient")
  getPhotoUrl(
    @Param("id") id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.service.getDeliveryPhotoSignedUrl(id, user.userId);
  }

  @Patch(":id/received")
  @Roles("patient")
  markAsReceived(
    @Param("id") id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.service.markAsReceived(id, user.userId);
  }
}
