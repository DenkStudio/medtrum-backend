import { Module } from "@nestjs/common";
import { ClaimsAdminService } from "./claims.admin.service";
import { ClaimsAdminController } from "./claims.admin.controller";
import { UsersModule } from "../users/users.module";
import { ClaimsController } from "./claims.controller";
import { ClaimsService } from "./claims.service";
import { DeliveriesModule } from "../deliveries/deliveries.module";
import { HardwareModule } from "../hardware/hardware.module";

@Module({
  imports: [UsersModule, DeliveriesModule, HardwareModule],
  providers: [ClaimsAdminService, ClaimsService],
  controllers: [ClaimsAdminController, ClaimsController],
})
export class ClaimsModule {}
