import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDoctorDto } from "./dto/create-doctor.dto";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { buildDateRangeFilter } from "src/utils/paginate-query";
import { Prisma } from "@prisma/client";

@Injectable()
export class DoctorsAdminService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateDoctorDto, user: AuthUser) {
    return this.prisma.doctor.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
  }

  async findAll(query: QueryOptionsDto, user: AuthUser) {
    const { page = 1, limit = 20, from, to, search } = query;
    const where: Prisma.DoctorWhereInput = {};

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.doctor.count({ where }),
      this.prisma.doctor.findMany({
        where,
        orderBy: { lastName: "asc" },
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
    const doctor = await this.prisma.doctor.findUnique({
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

    if (!doctor) {
      throw new NotFoundException("Doctor not found");
    }

    return doctor;
  }

  async update(id: string, data: Partial<CreateDoctorDto>, user: AuthUser) {
    await this.findById(id, user);

    return this.prisma.doctor.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, user: AuthUser) {
    await this.findById(id, user);

    return this.prisma.doctor.delete({
      where: { id },
    });
  }
}
