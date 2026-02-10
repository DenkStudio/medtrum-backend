import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { passportJwtSecret } from "jwks-rsa";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    const supabaseUrl = configService.get<string>("SUPABASE_URL")!;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      }),
      algorithms: ["ES256"],
    });
  }

  async validate(payload: any) {
    const supabaseId = payload.sub;
    if (!supabaseId) {
      throw new UnauthorizedException("Invalid token");
    }

    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    let patientId: string | undefined;
    if (user.role === "patient") {
      patientId = user.id;
    }

    let educatorId: string | undefined;
    if (user.role === "educator") {
      const educator = await this.prisma.educator.findUnique({
        where: { userId: user.id },
      });
      if (educator) educatorId = educator.id;
    }

    return {
      userId: user.id,
      role: user.role,
      orgId: user.organizationId,
      patientId,
      educatorId,
    };
  }
}
