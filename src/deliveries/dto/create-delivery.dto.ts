import {
  IsUUID,
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  Min,
  IsDateString,
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
  observations?: string;
}
