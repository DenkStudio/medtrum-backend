import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSuperEducatorDto } from "./dto/create-super-educator.dto";
import { UserRole } from "@prisma/client";
import { SupabaseService } from "../supabase/supabase.service";
import { MailService } from "../mail/mail.service";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { buildDateRangeFilter } from "src/utils/paginate-query";
import { Prisma } from "@prisma/client";

@Injectable()
export class SuperEducatorsAdminService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async create(dto: CreateSuperEducatorDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException("Email already in use");

    let supabaseData: any;

    if (dto.sendInvite !== false) {
      const redirectTo = `${this.config.get("FRONTEND_URL")}/update-password`;
      const { data, error } =
        await this.supabase.adminClient.auth.admin.generateLink({
          type: "invite",
          email: dto.email,
          options: { redirectTo },
        });
      if (error) throw new BadRequestException(error.message);
      supabaseData = data;

      this.mail.sendInvitationEmail({
        email: dto.email,
        name: dto.fullName,
        actionLink: data.properties.action_link,
      });
    } else {
      const { data, error } =
        await this.supabase.adminClient.auth.admin.createUser({
          email: dto.email,
          password: dto.password,
          email_confirm: true,
        });
      if (error) {
        throw new InternalServerErrorException(
          `Failed to create Supabase user: ${error.message}`,
        );
      }
      supabaseData = data;
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        supabaseId: supabaseData.user.id,
        role: UserRole.super_educator,
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
      },
    });

    await this.prisma.educator.create({
      data: {
        name: dto.fullName,
        province: dto.province,
        telephone: dto.phoneNumber,
        userId: user.id,
      },
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async findAll(query: QueryOptionsDto) {
    const { from, to, search } = query;
    const where: Prisma.UserWhereInput = {
      role: UserRole.super_educator,
    };

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      include: {
        educatorProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        educatorProfile: true,
      },
    });

    if (!user || user.role !== UserRole.super_educator) {
      throw new NotFoundException("Super educator not found");
    }

    return user;
  }

  async remove(id: string) {
    const user = await this.findById(id);

    if (user.supabaseId) {
      const { error } =
        await this.supabase.adminClient.auth.admin.deleteUser(
          user.supabaseId,
        );
      if (error) {
        throw new InternalServerErrorException(
          `Failed to delete Supabase user: ${error.message}`,
        );
      }
    }

    // Delete educator profile first (if exists)
    if (user.educatorProfile) {
      await this.prisma.educator.delete({
        where: { id: user.educatorProfile.id },
      });
    }

    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }
}
