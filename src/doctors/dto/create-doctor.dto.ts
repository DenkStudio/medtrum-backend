import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsUUID,
} from "class-validator";

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  province!: string;

  @IsArray()
  @IsOptional()
  @IsUUID("4", { each: true })
  healthcares?: string[];

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
