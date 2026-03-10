import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { SupplyType } from "@prisma/client";

export class CreateHardwareItemDto {
  @IsEnum(SupplyType) type!: SupplyType;
  @IsString() @IsNotEmpty() serialNumber!: string;
  @IsOptional() @IsString() lotNumber?: string;
}
