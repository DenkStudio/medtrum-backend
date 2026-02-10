import { Module } from "@nestjs/common";
import { ClaimsAdminService } from "./claims.admin.service";
import { ClaimsAdminController } from "./claims.admin.controller";
import { UsersModule } from "../users/users.module";
import { Claimsontroller } from "./claims.controller";
import { ClaimsService } from "./claims.service";
import { DeliveriesModule } from "../deliveries/deliveries.module";

@Module({
  imports: [UsersModule, DeliveriesModule],
  providers: [ClaimsAdminService, ClaimsService],
  controllers: [ClaimsAdminController, Claimsontroller],
})
export class ClaimsModule {}
