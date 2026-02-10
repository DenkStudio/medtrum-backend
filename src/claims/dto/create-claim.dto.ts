import { IsOptional, IsString, IsBoolean, IsEnum, IsDateString } from "class-validator";
import { ClaimCategory, ClaimErrorCode, SupplyType } from "@prisma/client";

export class CreateClaimDto {
  @IsOptional() @IsEnum(SupplyType) supply?: SupplyType;
  @IsOptional() daysClaimed!: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() lotNumber?: string;
  @IsOptional() @IsBoolean() needsReplacement?: boolean;
  @IsOptional() @IsEnum(ClaimCategory) claimCategory?: ClaimCategory;
  @IsOptional() @IsEnum(ClaimErrorCode) errorCode?: ClaimErrorCode;
  @IsOptional() @IsString() photoUrl?: string;
  @IsOptional() @IsDateString() failureDate?: string;
  @IsOptional() @IsDateString() colocationDate?: string;
}
