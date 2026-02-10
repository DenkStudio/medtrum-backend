import { Injectable, UnauthorizedException } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly prisma: PrismaService
  ) {}

  async validateUser(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const user = await this.prisma.user.findUnique({
      where: { supabaseId: data.user.id },
    });

    if (!user) {
      throw new UnauthorizedException("User not found in system");
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async refreshToken(refreshToken: string) {
    const { data, error } = await this.supabase.client.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    };
  }
}
