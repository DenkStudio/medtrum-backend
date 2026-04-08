import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min, Max } from "class-validator";

export class CalendarQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year!: number;

  @IsOptional()
  @IsString()
  organizationId?: string;
}
