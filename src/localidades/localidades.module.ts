import { Module } from "@nestjs/common";
import { LocalidadesAdminService } from "./localidades.admin.service";
import { LocalidadesAdminController } from "./localidades.admin.controller";

@Module({
  providers: [LocalidadesAdminService],
  controllers: [LocalidadesAdminController],
  exports: [LocalidadesAdminService],
})
export class LocalidadesModule {}
