import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLogisticaDto } from "./dto/create-logistica.dto";
import { UserRole } from "@prisma/client";
import { SupabaseService } from "../supabase/supabase.service";
import { parseDate } from "../common/helpers/date.helper";
import {
  AuthUser,
  buildOrgFilter,
  getCreateOrgId,
} from "../common/helpers/organization-filter.helper";
import { MailService } from "../mail/mail.service";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { buildDateRangeFilter } from "src/utils/paginate-query";
import { Prisma } from "@prisma/client";

@Injectable()
export class LogisticaAdminService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async create(dto: CreateLogisticaDto, user: AuthUser) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException("Email already in use");

    let supabaseData: any;

    if (dto.sendInvite) {
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

    const organizationId = getCreateOrgId(user, dto.organizationId);

    const created = await this.prisma.user.create({
      data: {
        email: dto.email,
        supabaseId: supabaseData.user.id,
        role: UserRole.logistica,
        organizationId,
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        dni: dto.dni,
        address: dto.address,
        birthDate: dto.birthDate ? parseDate(dto.birthDate) : undefined,
        province: dto.province,
      },
    });

    return { id: created.id, email: created.email, role: created.role };
  }

  async findAll(query: QueryOptionsDto, user: AuthUser) {
    const { page = 1, limit = 20, from, to, search } = query;
    const where: Prisma.UserWhereInput = {
      role: UserRole.logistica,
      ...buildOrgFilter(user),
    };

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: { organization: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const logUser = await this.prisma.user.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!logUser || logUser.role !== UserRole.logistica) {
      throw new NotFoundException("Logistics user not found");
    }

    return logUser;
  }

  async update(id: string, dto: Partial<CreateLogisticaDto>) {
    const logUser = await this.findById(id);

    if (dto.email) {
      const exists = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (exists) throw new ConflictException("Email already in use");
    }

    if (logUser.supabaseId && (dto.email || dto.password)) {
      const supabaseUpdate: { email?: string; password?: string } = {};
      if (dto.email) supabaseUpdate.email = dto.email;
      if (dto.password) supabaseUpdate.password = dto.password;

      const { error } =
        await this.supabase.adminClient.auth.admin.updateUserById(
          logUser.supabaseId,
          supabaseUpdate,
        );
      if (error) {
        throw new InternalServerErrorException(
          `Failed to update Supabase user: ${error.message}`,
        );
      }
    }

    const { password, sendInvite, organizationId, ...updateFields } = dto;

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateFields,
        birthDate: dto.birthDate ? parseDate(dto.birthDate) : undefined,
        ...(organizationId
          ? { organization: { connect: { id: organizationId } } }
          : {}),
      },
      include: { organization: true },
    });

    return updated;
  }

  async remove(id: string) {
    const logUser = await this.findById(id);

    if (logUser.supabaseId) {
      const { error } =
        await this.supabase.adminClient.auth.admin.deleteUser(
          logUser.supabaseId,
        );
      if (error) {
        throw new InternalServerErrorException(
          `Failed to delete Supabase user: ${error.message}`,
        );
      }
    }

    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }
}
