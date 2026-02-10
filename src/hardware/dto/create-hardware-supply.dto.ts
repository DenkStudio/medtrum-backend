import { IsNotEmpty, IsString, IsEnum, IsUUID, IsOptional } from "class-validator";
import { HardwareType } from "@prisma/client";

export class CreateHardwareSupplyDto {
  @IsEnum(HardwareType) type!: HardwareType;
  @IsString() @IsNotEmpty() serialNumber!: string;
  @IsUUID() @IsNotEmpty() userId!: string;
  @IsOptional() @IsUUID() organizationId?: string;
}
