import { IsString, IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class CreateHealthcareDto {
  @IsString()
  @IsNotEmpty()
  tradeName!: string;

  @IsString()
  @IsNotEmpty()
  legalName!: string;

  @IsString()
  @IsNotEmpty()
  cuit!: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
