import {
  IsUUID,
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsDateString,
} from "class-validator";

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
  @IsString()
  itemName?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
