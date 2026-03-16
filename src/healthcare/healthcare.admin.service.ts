import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateHealthcareDto } from "./dto/create-healthcare.dto";
import {
  AuthUser,
  buildOrgFilter,
  canAccessOrg,
  getCreateOrgId,
} from "../common/helpers/organization-filter.helper";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { buildDateRangeFilter } from "src/utils/paginate-query";
import { Prisma } from "@prisma/client";

@Injectable()
export class HealthcareAdminService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateHealthcareDto, user: AuthUser) {
    const organizationId = getCreateOrgId(user, data.organizationId);

    const exists = await this.prisma.healthcare.findFirst({
      where: { cuit: data.cuit },
    });
    if (exists)
      throw new ConflictException("Healthcare with this CUIT already exists");
    return this.prisma.healthcare.create({
      data: {
        tradeName: data.tradeName,
        legalName: data.legalName,
        cuit: data.cuit,
        organizationId,
      },
    });
  }

  async findAll(query: QueryOptionsDto, user: AuthUser) {
    const { from, to, organization } = query;
    const where: Prisma.HealthcareWhereInput = {
      ...buildOrgFilter(user),
      ...(organization && { organizationId: organization }),
    };

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;

    return this.prisma.healthcare.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findById(id: string, user: AuthUser) {
    const healthcare = await this.prisma.healthcare.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!healthcare) throw new NotFoundException("Healthcare not found");

    if (!canAccessOrg(user, healthcare.organizationId)) {
      throw new ForbiddenException("Cannot access healthcare from different organization");
    }

    return healthcare;
  }
}
