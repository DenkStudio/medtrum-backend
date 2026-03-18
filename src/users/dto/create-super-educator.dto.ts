import {
  IsEmail,
  IsOptional,
  IsString,
  IsBoolean,
  MinLength,
  ValidateIf,
} from "class-validator";

export class CreateSuperEducatorDto {
  @IsEmail()
  email!: string;

  @ValidateIf((o) => !o.sendInvite)
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsBoolean()
  sendInvite?: boolean;

  @IsString()
  fullName!: string;

  @IsString()
  province!: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
