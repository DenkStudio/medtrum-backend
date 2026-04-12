import { IsDateString, IsOptional, IsUUID } from "class-validator";

export class ClaimsChartQueryDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
