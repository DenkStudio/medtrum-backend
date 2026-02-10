import { IsString, IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class CreateEducatorDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  province!: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
