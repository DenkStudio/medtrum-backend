import { IsDateString } from "class-validator";

export class ClaimsChartQueryDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}
