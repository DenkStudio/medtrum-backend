import { IsString, IsOptional, IsDateString, IsIn } from "class-validator";

export class CreateCalendarEventDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(["sky", "indigo", "amber", "emerald", "rose"])
  color?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
