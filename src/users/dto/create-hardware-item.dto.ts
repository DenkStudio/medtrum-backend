import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { SupplyType } from "@prisma/client";

export class CreateHardwareItemDto {
  @IsEnum(SupplyType) type!: SupplyType;
  @IsString() @IsNotEmpty() serialNumber!: string;
}
