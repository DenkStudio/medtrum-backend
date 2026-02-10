import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMedicalEntryDto } from "./dto/create-medical-entry.dto";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { PaginatedResult, buildOrderBy, buildDateRangeFilter } from "src/utils/paginate-query";
import { parseDate } from "../common/helpers/date.helper";

@Injectable()
export class MedicalEntriesEducatorService {
  constructor(private prisma: PrismaService) {}

  private async validatePatientOwnership(
    educatorId: string,
    patientId: string
  ) {
    const patient = await this.prisma.user.findUnique({
      where: { id: patientId },
    });

    if (!patient || patient.role !== "patient") {
      throw new NotFoundException("Patient not found");
    }

    if (patient.educatorId !== educatorId) {
      throw new ForbiddenException("Patient not assigned to you");
    }

    return patient;
  }

  async create(
    educatorId: string,
    userId: string,
    dto: CreateMedicalEntryDto
  ) {
    await this.validatePatientOwnership(educatorId, dto.patientId);

    return this.prisma.medicalEntry.create({
      data: {
        patientId: dto.patientId,
        createdById: userId,
        visitDate: parseDate(dto.visitDate),
        notes: dto.notes,
      },
      include: {
        patient: true,
        createdBy: true,
      },
    });
  }

  async findByPatientId(
    educatorId: string,
    patientId: string,
    query: QueryOptionsDto
  ): Promise<PaginatedResult<any>> {
    await this.validatePatientOwnership(educatorId, patientId);

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

  async findOne(educatorId: string, id: string) {
    const entry = await this.prisma.medicalEntry.findUnique({
      where: { id },
      include: { patient: true, createdBy: true },
    });

    if (!entry) throw new NotFoundException("Medical entry not found");

    await this.validatePatientOwnership(educatorId, entry.patientId);

    return entry;
  }
}
