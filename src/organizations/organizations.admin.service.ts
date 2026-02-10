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

  findAll(query: QueryOptionsDto) {
    const { from, to } = query;
    const where: Prisma.OrganizationWhereInput = {};

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;

    return this.prisma.organization.findMany({
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
}
