import { IsEnum, IsOptional, IsString } from "class-validator";
import { ClaimStatus } from "@prisma/client";

export class SetClaimStatusDto {
  @IsEnum(ClaimStatus) status!: ClaimStatus;
  @IsOptional() @IsString() resolutionMessage?: string;
}
