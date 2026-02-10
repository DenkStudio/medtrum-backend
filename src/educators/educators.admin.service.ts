import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEducatorDto } from "./dto/create-educator.dto";
import {
  AuthUser,
  buildOrgFilter,
  getCreateOrgId,
  canAccessOrg,
} from "../common/helpers/organization-filter.helper";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { buildDateRangeFilter } from "src/utils/paginate-query";
import { Prisma } from "@prisma/client";

@Injectable()
export class EducatorsAdminService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEducatorDto, user: AuthUser) {
    const organizationId = getCreateOrgId(user, data.organizationId);

    return this.prisma.educator.create({
      data: {
        name: data.name,
        province: data.province,
        telephone: data.telephone,
        organizationId,
        userId: data.userId,
      },
    });
  }

  async findAll(query: QueryOptionsDto, user: AuthUser) {
    const { from, to, organization } = query;
    const where: Prisma.EducatorWhereInput = {
      ...buildOrgFilter(user),
      ...(organization && { organizationId: organization }),
    };

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;

    return this.prisma.educator.findMany({
      where,
      include: {
        patients: {
          where: { role: "patient" },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            phoneNumber: true,
            dni: true,
            address: true,
            birthDate: true,
            province: true,
          },
        },
      },
    });
  }

  async findById(id: string, user: AuthUser) {
    const educator = await this.prisma.educator.findUnique({
      where: { id },
      include: {
        patients: {
          where: { role: "patient" },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            phoneNumber: true,
            dni: true,
            address: true,
            birthDate: true,
            province: true,
          },
        },
      },
    });

    if (!educator) {
      throw new NotFoundException("Educator not found");
    }

    if (!canAccessOrg(user, educator.organizationId)) {
      throw new ForbiddenException("Cannot access educator from different organization");
    }

    return educator;
  }

  async update(id: string, data: Partial<CreateEducatorDto>, user: AuthUser) {
    await this.findById(id, user);

    const { organizationId, userId, ...updateData } = data;

    return this.prisma.educator.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string, user: AuthUser) {
    await this.findById(id, user);

    return this.prisma.educator.delete({
      where: { id },
    });
  }
}
