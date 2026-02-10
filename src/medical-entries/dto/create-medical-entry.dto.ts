import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreateMedicalEntryDto {
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsDateString()
  visitDate!: string;

  @IsString()
  @IsNotEmpty()
  notes!: string;
}
