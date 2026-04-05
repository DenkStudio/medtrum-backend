import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OrganizationName, Prisma } from "@prisma/client";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { buildDateRangeFilter } from "src/utils/paginate-query";

@Injectable()
export class OrganizationsAdminService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: OrganizationName; code: string }) {
    const exists = await this.prisma.organization.findFirst({
      where: {
        OR: [{ name: data.name }, { code: data.code }],
      },
    });
    if (exists) throw new ConflictException("Organization exists");
    return this.prisma.organization.create({ data });
  }

  async findAll(query: QueryOptionsDto) {
    const { page = 1, limit = 20, from, to } = query;
    const where: Prisma.OrganizationWhereInput = {};

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.organization.count({ where }),
      this.prisma.organization.findMany({
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
}
