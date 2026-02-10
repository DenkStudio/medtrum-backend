import { SupabaseService } from "../supabase/supabase.service";
import { PrismaService } from "../prisma/prisma.service";
export declare class AuthService {
    private readonly supabase;
    private readonly prisma;
    constructor(supabase: SupabaseService, prisma: PrismaService);
    validateUser(email: string, password: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map