import { AuthService } from "./auth.service";
declare class LoginDto {
    email: string;
    password: string;
}
declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
}
export {};
//# sourceMappingURL=auth.controller.d.ts.map