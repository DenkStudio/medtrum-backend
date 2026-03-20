import { IsString, IsOptional, IsDateString } from "class-validator";

export class UpdateHardwareLogisticaDto {
  @IsOptional() @IsString() serialNumber?: string;
  @IsOptional() @IsString() lotNumber?: string;
  @IsOptional() @IsDateString() saleDate?: string;
  @IsOptional() @IsString() linkedSerialNumber?: string;
}
