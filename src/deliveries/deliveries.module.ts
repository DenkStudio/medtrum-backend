import { Module } from "@nestjs/common";
import { DeliveriesAdminService } from "./deliveries.admin.service";
import { DeliveriesAdminController } from "./deliveries.admin.controller";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [UsersModule],
  providers: [DeliveriesAdminService],
  controllers: [DeliveriesAdminController],
  exports: [DeliveriesAdminService],
})
export class DeliveriesModule {}
