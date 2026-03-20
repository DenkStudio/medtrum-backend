import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString } from "class-validator";
import { SupplyType } from "@prisma/client";

export class CreateHardwareItemDto {
  @IsEnum(SupplyType) type!: SupplyType;
  @IsOptional() @IsString() serialNumber?: string;
  @IsOptional() @IsString() lotNumber?: string;
  @IsOptional() @IsDateString() saleDate?: string;
  @IsOptional() @IsDateString() placementDate?: string;
  @IsOptional() @IsString() pdmSerialNumber?: string;
}
