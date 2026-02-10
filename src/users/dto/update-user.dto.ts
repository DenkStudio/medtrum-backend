import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsDateString,
  IsNumber,
  IsUUID,
} from "class-validator";
import { UserRole } from "@prisma/client";

export class UpdateUserDto {
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MinLength(6) password?: string;
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
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
  @IsOptional() @IsNumber() balanceDaysSensor?: number;
  @IsOptional() @IsNumber() balanceDaysParche?: number;
}
