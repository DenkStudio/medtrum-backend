import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import {
  PaginatedResult,
  buildSearchFilter,
  buildOrderBy,
  buildDateRangeFilter,
} from "src/utils/paginate-query";
import { Prisma } from "@prisma/client";
import { parseDate } from "../common/helpers/date.helper";
import { AuthUser } from "../common/helpers/organization-filter.helper";

@Injectable()
export class EducatorsService {
  constructor(private prisma: PrismaService) {}

  private buildPatientFilter(user: AuthUser): Prisma.UserWhereInput {
    if (user.role === "super_educator") {
      return { role: "patient" };
    }
    return { role: "patient", organizationId: user.orgId };
  }

  async findMyPatients(
    user: AuthUser,
    query: QueryOptionsDto
  ): Promise<PaginatedResult<any>> {
    const { page, limit, search, sort, from, to } = query;

    const where: Prisma.UserWhereInput = this.buildPatientFilter(user);

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;

    const searchFilter = buildSearchFilter(search, ["email", "fullName"]);
    if (searchFilter) {
      where.AND = [searchFilter];
    }

    const [total, data] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: buildOrderBy(sort),
        skip: (page - 1) * limit,
        take: limit,
        include: {
          healthcare: true,
          doctor: true,
          educator: { select: { id: true, name: true } },
        },
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

  async findMyPatientById(user: AuthUser, patientId: string) {
    const patient = await this.prisma.user.findUnique({
      where: { id: patientId },
      include: {
        healthcare: true,
        doctor: true,
        organization: true,
        claims: { orderBy: { createdAt: "desc" } },
        hardwareSupplies: true,
        medicalEntries: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!patient || patient.role !== "patient") {
      throw new NotFoundException("Patient not found");
    }

    if (user.role !== "super_educator" && patient.organizationId !== user.orgId) {
      throw new ForbiddenException("Patient does not belong to your organization");
    }

    return patient;
  }

  async updateMyPatient(
    user: AuthUser,
    patientId: string,
    dto: UpdatePatientDto
  ) {
    await this.findMyPatientById(user, patientId);

    return this.prisma.user.update({
      where: { id: patientId },
      data: {
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        dni: dto.dni,
        address: dto.address,
        birthDate: dto.birthDate ? parseDate(dto.birthDate) : undefined,
        province: dto.province,
      },
    });
  }
}
