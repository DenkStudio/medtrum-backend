import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { IsEmail, IsString } from "class-validator";

class LoginDto {
  @IsEmail() email!: string;
  @IsString() password!: string;
}

class RefreshTokenDto {
  @IsString() refreshToken!: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.validateUser(dto.email, dto.password);
  }

  @Post("refresh")
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }
}
