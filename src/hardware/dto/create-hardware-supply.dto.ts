import { IsNotEmpty, IsString, IsEnum, IsUUID, IsOptional } from "class-validator";
import { SupplyType } from "@prisma/client";

export class CreateHardwareSupplyDto {
  @IsEnum(SupplyType) type!: SupplyType;
  @IsString() @IsNotEmpty() serialNumber!: string;
  @IsUUID() @IsNotEmpty() userId!: string;
  @IsOptional() @IsUUID() organizationId?: string;
}
