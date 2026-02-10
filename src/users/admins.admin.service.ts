import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UserRole } from "@prisma/client";
import { SupabaseService } from "../supabase/supabase.service";
import { parseDate } from "../common/helpers/date.helper";
import {
  AuthUser,
  buildOrgFilter,
} from "../common/helpers/organization-filter.helper";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { buildDateRangeFilter } from "src/utils/paginate-query";
import { Prisma } from "@prisma/client";

@Injectable()
export class AdminsAdminService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
    private config: ConfigService
  ) {}

  async create(dto: CreateAdminDto, user: AuthUser) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException("Email already in use");

    let supabaseData: any;

    if (dto.sendInvite) {
      const redirectTo = `${this.config.get("FRONTEND_URL")}/update-password`;
      const { data, error } =
        await this.supabase.adminClient.auth.admin.inviteUserByEmail(
          dto.email,
          { redirectTo }
        );
      if (error) throw new BadRequestException(error.message);
      supabaseData = data;
    } else {
      const { data, error } =
        await this.supabase.adminClient.auth.admin.createUser({
          email: dto.email,
          password: dto.password,
          email_confirm: true,
        });
      if (error) {
        throw new InternalServerErrorException(
          `Failed to create Supabase user: ${error.message}`
        );
      }
      supabaseData = data;
    }

    const organizationId = dto.organizationId;

    const created = await this.prisma.user.create({
      data: {
        email: dto.email,
        supabaseId: supabaseData.user.id,
        role: UserRole.admin,
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
    const { from, to } = query;
    const where: Prisma.UserWhereInput = { role: UserRole.admin, ...buildOrgFilter(user) };

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;

    return this.prisma.user.findMany({
      where,
      include: { organization: true },
    });
  }

  async findById(id: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!admin || admin.role !== UserRole.admin) {
      throw new NotFoundException("Admin not found");
    }

    return admin;
  }

  async update(id: string, dto: Partial<CreateAdminDto>) {
    const admin = await this.findById(id);

    if (admin.supabaseId && (dto.email || dto.password)) {
      const supabaseUpdate: { email?: string; password?: string } = {};
      if (dto.email) supabaseUpdate.email = dto.email;
      if (dto.password) supabaseUpdate.password = dto.password;

      const { error } =
        await this.supabase.adminClient.auth.admin.updateUserById(
          admin.supabaseId,
          supabaseUpdate
        );
      if (error) {
        throw new InternalServerErrorException(
          `Failed to update Supabase user: ${error.message}`
        );
      }
    }

    if (dto.email) {
      const exists = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (exists) throw new ConflictException("Email already in use");
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
    const admin = await this.findById(id);

    if (admin.supabaseId) {
      const { error } =
        await this.supabase.adminClient.auth.admin.deleteUser(
          admin.supabaseId
        );
      if (error) {
        throw new InternalServerErrorException(
          `Failed to delete Supabase user: ${error.message}`
        );
      }
    }

    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }
}
