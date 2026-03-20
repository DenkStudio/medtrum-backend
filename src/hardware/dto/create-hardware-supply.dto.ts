import { IsNotEmpty, IsString, IsEnum, IsUUID, IsOptional, IsDateString } from "class-validator";
import { SupplyType } from "@prisma/client";

export class CreateHardwareSupplyDto {
  @IsEnum(SupplyType) type!: SupplyType;
  @IsOptional() @IsString() serialNumber?: string;
  @IsOptional() @IsString() lotNumber?: string;
  @IsUUID() @IsNotEmpty() userId!: string;
  @IsOptional() @IsUUID() organizationId?: string;
  @IsOptional() @IsDateString() saleDate?: string;
  @IsOptional() @IsDateString() placementDate?: string;
  @IsOptional() @IsString() pdmSerialNumber?: string;
}
