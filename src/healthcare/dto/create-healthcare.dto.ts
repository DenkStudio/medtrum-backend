import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateHealthcareDto {
  @IsString()
  @IsNotEmpty()
  tradeName!: string;

  @IsString()
  @IsNotEmpty()
  legalName!: string;

  @IsString()
  @IsOptional()
  cuit?: string;

  @IsString()
  @IsOptional()
  rnos?: string;

  @IsString()
  @IsOptional()
  sigla?: string;
}
