import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateHealthcareDto } from "./dto/create-healthcare.dto";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { buildDateRangeFilter } from "src/utils/paginate-query";
import { Prisma } from "@prisma/client";

@Injectable()
export class HealthcareAdminService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateHealthcareDto, user: AuthUser) {
    if (data.cuit) {
      const exists = await this.prisma.healthcare.findFirst({
        where: { cuit: data.cuit },
      });
      if (exists)
        throw new ConflictException("Healthcare with this CUIT already exists");
    }
    return this.prisma.healthcare.create({
      data: {
        tradeName: data.tradeName,
        legalName: data.legalName,
        cuit: data.cuit,
        rnos: data.rnos,
        sigla: data.sigla,
      },
    });
  }

  async findAll(query: QueryOptionsDto, user: AuthUser) {
    const { page = 1, limit = 20, from, to, search } = query;
    const where: Prisma.HealthcareWhereInput = {};

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;

    if (search) {
      where.OR = [
        { tradeName: { contains: search, mode: "insensitive" } },
        { legalName: { contains: search, mode: "insensitive" } },
        { sigla: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.healthcare.count({ where }),
      this.prisma.healthcare.findMany({
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

    return healthcare;
  }
}
