import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateHealthcareDto } from "./dto/create-healthcare.dto";
import {
  AuthUser,
  buildOrgFilter,
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

    const code = data.name.toUpperCase();
    const exists = await this.prisma.healthcare.findFirst({
      where: {
        OR: [{ name: data.name }, { code }],
      },
    });
    if (exists)
      throw new ConflictException("Healthcare with this name or code exists");
    return this.prisma.healthcare.create({
      data: {
        name: data.name,
        code,
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
        doctors: {
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                province: true,
                telephone: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.healthcare.findUnique({
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
        doctors: {
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                province: true,
                telephone: true,
              },
            },
          },
        },
      },
    });
  }
}
