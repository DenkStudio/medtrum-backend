import { IsString, IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class CreateHealthcareDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
