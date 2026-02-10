import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { PaginatedResult, buildOrderBy, buildDateRangeFilter } from "src/utils/paginate-query";

@Injectable()
export class MedicalEntriesAdminService {
  constructor(private prisma: PrismaService) {}

  async findByPatientId(
    patientId: string,
    query: QueryOptionsDto
  ): Promise<PaginatedResult<any>> {
    const { page, limit, sort, from, to } = query;

    const where: any = { patientId };
    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;

    const [total, data] = await Promise.all([
      this.prisma.medicalEntry.count({ where }),
      this.prisma.medicalEntry.findMany({
        where,
        include: { createdBy: true },
        orderBy: buildOrderBy(sort) || { visitDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  async findOne(id: string) {
    const entry = await this.prisma.medicalEntry.findUnique({
      where: { id },
      include: { patient: true, createdBy: true },
    });
    if (!entry) throw new NotFoundException("Medical entry not found");
    return entry;
  }
}
