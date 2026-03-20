import { IsString, IsNotEmpty } from "class-validator";

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;
}
