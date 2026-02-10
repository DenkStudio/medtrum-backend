import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDoctorDto } from "./dto/create-doctor.dto";
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
export class DoctorsAdminService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateDoctorDto, user: AuthUser) {
    const organizationId = getCreateOrgId(user, data.organizationId);

    return this.prisma.doctor.create({
      data: {
        name: data.name,
        province: data.province,
        telephone: data.telephone,
        organizationId,
        healthcares: data.healthcares?.length
          ? {
              create: data.healthcares.map((healthcareId) => ({
                healthcareId,
              })),
            }
          : undefined,
      },
      include: {
        healthcares: {
          include: { healthcare: true },
        },
      },
    });
  }

  async findAll(query: QueryOptionsDto, user: AuthUser) {
    const { from, to, organization } = query;
    const where: Prisma.DoctorWhereInput = {
      ...buildOrgFilter(user),
      ...(organization && { organizationId: organization }),
    };

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;

    const doctors = await this.prisma.doctor.findMany({
      where,
      include: {
        healthcares: {
          include: { healthcare: true },
        },
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

    // Transform healthcares to flat array for API compatibility
    return doctors.map((doctor) => ({
      ...doctor,
      healthcares: doctor.healthcares.map((dh) => dh.healthcare),
    }));
  }

  async findById(id: string, user: AuthUser) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        healthcares: {
          include: { healthcare: true },
        },
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

    if (!doctor) {
      throw new NotFoundException("Doctor not found");
    }

    if (!canAccessOrg(user, doctor.organizationId)) {
      throw new ForbiddenException("Cannot access doctor from different organization");
    }

    return {
      ...doctor,
      healthcares: doctor.healthcares.map((dh) => dh.healthcare),
    };
  }

  async update(id: string, data: Partial<CreateDoctorDto>, user: AuthUser) {
    await this.findById(id, user);

    // If healthcares are provided, we need to update the many-to-many relation
    if (data.healthcares) {
      // Delete existing relations
      await this.prisma.doctorHealthcare.deleteMany({
        where: { doctorId: id },
      });

      // Create new relations
      await this.prisma.doctorHealthcare.createMany({
        data: data.healthcares.map((healthcareId) => ({
          doctorId: id,
          healthcareId,
        })),
      });
    }

    const { healthcares, organizationId, ...updateData } = data;

    return this.prisma.doctor.update({
      where: { id },
      data: updateData,
      include: {
        healthcares: {
          include: { healthcare: true },
        },
      },
    });
  }

  async delete(id: string, user: AuthUser) {
    await this.findById(id, user);

    return this.prisma.doctor.delete({
      where: { id },
    });
  }
}
