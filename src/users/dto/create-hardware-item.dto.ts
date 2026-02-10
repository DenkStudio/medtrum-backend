import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { HardwareType } from "@prisma/client";

export class CreateHardwareItemDto {
  @IsEnum(HardwareType) type!: HardwareType;
  @IsString() @IsNotEmpty() serialNumber!: string;
}
