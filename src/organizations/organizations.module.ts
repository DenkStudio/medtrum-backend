import { Module } from "@nestjs/common";
import { OrganizationsAdminService } from "./organizations.admin.service";
import { OrganizationsAdminController } from "./organizations.admin.controller";

@Module({
  providers: [OrganizationsAdminService],
  controllers: [OrganizationsAdminController],
  exports: [OrganizationsAdminService],
})
export class OrganizationsModule {}
