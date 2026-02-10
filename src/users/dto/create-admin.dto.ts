import {
  IsEmail,
  IsOptional,
  IsString,
  IsBoolean,
  MinLength,
  IsDateString,
  IsUUID,
  ValidateIf,
} from "class-validator";

export class CreateAdminDto {
  @IsEmail()
  email!: string;

  @ValidateIf((o) => !o.sendInvite)
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsBoolean()
  sendInvite?: boolean;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  dni?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
