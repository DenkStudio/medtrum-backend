import { Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: any): Promise<{
        userId: string;
        role: import(".prisma/client").$Enums.UserRole;
        orgId: string | null;
        patientId: string | undefined;
        educatorId: string | undefined;
    }>;
}
export {};
//# sourceMappingURL=jwt.strategy.d.ts.map