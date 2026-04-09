import { Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

class ReturnedLotDto {
  @IsString() lotNumber!: string;
  @IsInt() @Min(1) qty!: number;
}

export class ReimburseClaimDto {
  @IsInt() @Min(0) qty!: number;
  @IsOptional() @IsInt() @Min(0) daysReimbursed?: number;
  @IsOptional() @IsString() resolutionMessage?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnedLotDto)
  returnedLots?: ReturnedLotDto[];

  @IsOptional() @IsString() reimbursementPhotoUrl?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) reimbursementPhotoUrls?: string[];
  @IsOptional() @IsString() trackingLink?: string;
  @IsOptional() @IsString() shippingDate?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) deliveryPhotoUrls?: string[];
  @IsOptional() @IsString() contactName?: string;
  @IsOptional() @IsString() contactPhone?: string;
  @IsOptional() @IsString() contactEmail?: string;
  @IsOptional() @IsString() replacementSerialNumber?: string;
  @IsOptional() @IsString() replacementLotNumber?: string;
  @IsOptional() @IsString() replacementPurchaseDate?: string;
}
