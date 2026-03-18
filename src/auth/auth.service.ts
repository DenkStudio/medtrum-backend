import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SupabaseService } from "../supabase/supabase.service";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
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

  async resetPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) return { message: "Si el email existe, recibirás un enlace para restablecer tu contraseña." };

    const redirectTo = `${this.config.get("FRONTEND_URL")}/update-password`;

    const { data, error } = await this.supabase.adminClient.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    if (error) throw new BadRequestException(error.message);

    this.mail.sendPasswordResetEmail({
      email,
      name: user.fullName ?? undefined,
      actionLink: data.properties.action_link,
    });

    return { message: "Si el email existe, recibirás un enlace para restablecer tu contraseña." };
  }
}
