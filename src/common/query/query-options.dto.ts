import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional, IsString, Min, IsIn, IsUUID } from "class-validator";
import { ClaimStatus, DeliveryType } from "@prisma/client";

export class QueryOptionsDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit = 20;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() sort?: string;
  @IsOptional()
  @IsString()
  @IsIn(["pending", "approved", "rejected"])
  status?: ClaimStatus;
  @IsOptional()
  @IsString()
  @IsIn(["superadmin", "admin", "patient"])
  role?: string;
  @IsOptional()
  @IsUUID()
  doctor?: string;
  @IsOptional()
  @IsUUID()
  healthcare?: string;
  @IsOptional()
  @IsUUID()
  organization?: string;
  @IsOptional()
  @IsString()
  @IsIn(["supply_delivery", "claim_reimbursement"])
  type?: DeliveryType;
  @IsOptional()
  @IsDateString()
  from?: string;
  @IsOptional()
  @IsDateString()
  to?: string;
}
