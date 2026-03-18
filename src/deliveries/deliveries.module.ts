import { Module } from "@nestjs/common";
import { DeliveriesAdminService } from "./deliveries.admin.service";
import { DeliveriesAdminController } from "./deliveries.admin.controller";
import { DeliveriesService } from "./deliveries.service";
import { DeliveriesController } from "./deliveries.controller";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [UsersModule],
  providers: [DeliveriesAdminService, DeliveriesService],
  controllers: [DeliveriesAdminController, DeliveriesController],
  exports: [DeliveriesAdminService, DeliveriesService],
})
export class DeliveriesModule {}
