import { IsString, IsEnum, IsOptional, IsUUID, IsDateString } from "class-validator";
import { SupplyType, HardwareStatus } from "@prisma/client";

export class UpdateHardwareSupplyDto {
  @IsOptional() @IsEnum(SupplyType) type?: SupplyType;
  @IsOptional() @IsString() serialNumber?: string;
  @IsOptional() @IsString() lotNumber?: string;
  @IsOptional() @IsEnum(HardwareStatus) status?: HardwareStatus;
  @IsOptional() @IsUUID() userId?: string;
  @IsOptional() @IsUUID() organizationId?: string;
  @IsOptional() @IsDateString() placementDate?: string;
  @IsOptional() @IsDateString() saleDate?: string;
}
