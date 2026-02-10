import { IsOptional, IsString, IsDateString } from "class-validator";

export class UpdatePatientDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() phoneNumber?: string;
  @IsOptional() @IsString() dni?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsDateString() birthDate?: string;
  @IsOptional() @IsString() province?: string;
}
