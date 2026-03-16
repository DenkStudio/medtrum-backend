import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateLocalidadDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  province!: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
