import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  MinLength,
  IsDateString,
  IsArray,
  ValidateNested,
  IsUUID,
  ValidateIf,
} from "class-validator";
import { Type } from "class-transformer";
import { UserRole } from "@prisma/client";
import { CreateHardwareItemDto } from "./create-hardware-item.dto";

export class CreateUserDto {
  @IsEmail() email!: string;

  @ValidateIf((o) => !o.sendInvite)
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional() @IsBoolean() sendInvite?: boolean;

  @IsEnum(UserRole) role!: UserRole;
  @IsOptional() @IsUUID() organization?: string;
  @IsOptional() @IsUUID() healthcare?: string;
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() phoneNumber?: string;
  @IsOptional() @IsString() dni?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsDateString() birthDate?: string;
  @IsOptional() @IsUUID() doctor?: string;
  @IsOptional() @IsUUID() educator?: string;
  @IsOptional() @IsString() province?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHardwareItemDto)
  hardwares?: CreateHardwareItemDto[];
}
