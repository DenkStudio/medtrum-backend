import {
  IsUUID,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  Min,
  IsDateString,
  ArrayMaxSize,
} from "class-validator";
import { SupplyType } from "@prisma/client";

export class CreateDeliveryDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;


  @IsOptional()
  @IsUUID()
  claimId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsInt()
  daysReimbursed?: number;

  @IsOptional()
  @IsEnum(SupplyType)
  itemName?: SupplyType;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  lotNumber?: string;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  courierName?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  internalPhotoUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  externalPhotoUrls?: string[];
}
