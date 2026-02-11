import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserRole, SupplyType, Prisma } from "@prisma/client";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import {
  PaginatedResult,
  buildSearchFilter,
  buildOrderBy,
  buildDateRangeFilter,
} from "src/utils/paginate-query";
import { HardwareAdminService } from "../hardware/hardware.admin.service";
import {
  AuthUser,
  buildOrgFilter,
  canAccessOrg,
} from "../common/helpers/organization-filter.helper";
import { SupabaseService } from "../supabase/supabase.service";
import { parseDate } from "../common/helpers/date.helper";

@Injectable()
export class UsersAdminService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => HardwareAdminService))
    private hardwareService: HardwareAdminService,
    private supabase: SupabaseService,
    private config: ConfigService
  ) {}

  async invite(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    const redirectTo = `${this.config.get("FRONTEND_URL")}/update-password`;

    const { data, error } =
      await this.supabase.adminClient.auth.admin.inviteUserByEmail(user.email, {
        redirectTo,
      });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { message: "Invitación enviada", data };
  }

  async create(dto: CreateUserDto, createdByUserId?: string) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException("Email already in use");

    let supabaseData: any;

    if (dto.sendInvite) {
      // Send invite via Supabase (no password)
      const redirectTo = `${this.config.get("FRONTEND_URL")}/update-password`;
      const { data, error } =
        await this.supabase.adminClient.auth.admin.inviteUserByEmail(
          dto.email,
          { redirectTo }
        );

      if (error) {
        throw new BadRequestException(error.message);
      }
      supabaseData = data;
    } else {
      // Create user with password
      const { data, error } =
        await this.supabase.adminClient.auth.admin.createUser({
          email: dto.email,
          password: dto.password,
          email_confirm: true,
        });

      if (error) {
        throw new InternalServerErrorException(
          `Failed to create Supabase user: ${error.message}`
        );
      }
      supabaseData = data;
    }

    let organizationId: string | undefined = dto.organization;

    if (createdByUserId && !organizationId) {
      const creator = await this.prisma.user.findUnique({
        where: { id: createdByUserId },
      });
      if (creator?.organizationId) {
        organizationId = creator.organizationId;
      }
    }

    const created = await this.prisma.user.create({
      data: {
        email: dto.email,
        supabaseId: supabaseData.user.id,
        role: dto.role,
        healthcareId: dto.healthcare,
        organizationId,
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        dni: dto.dni,
        address: dto.address,
        birthDate: dto.birthDate ? parseDate(dto.birthDate) : undefined,
        doctorId: dto.doctor,
        educatorId: dto.educator,
        province: dto.province,
      },
    });

    const createdHardwareIds: string[] = [];

    try {
      if (
        dto.role === UserRole.patient &&
        dto.hardwares &&
        dto.hardwares.length > 0
      ) {
        const createdBy = createdByUserId || created.id;

        const hardwarePromises = dto.hardwares.flatMap((hardware) => {
          const promises = [
            this.hardwareService
              .create(
                {
                  type: hardware.type,
                  serialNumber: hardware.serialNumber,
                  userId: created.id,
                },
                createdBy,
                organizationId
              )
              .then((hw) => {
                createdHardwareIds.push(hw.id);
                return hw;
              }),
          ];

          if (hardware.type === SupplyType.TRANSMISOR) {
            promises.push(
              this.hardwareService
                .create(
                  {
                    type: SupplyType.CABLE_TRANSMISOR,
                    serialNumber: hardware.serialNumber,
                    userId: created.id,
                  },
                  createdBy,
                  organizationId
                )
                .then((hw) => {
                  createdHardwareIds.push(hw.id);
                  return hw;
                })
            );
          }

          return promises;
        });

        await Promise.all(hardwarePromises);
      }

      return { id: created.id, email: created.email, role: created.role };
    } catch (error) {
      try {
        if (createdHardwareIds.length > 0) {
          await this.hardwareService.deleteMany(createdHardwareIds);
        }
        await this.prisma.user.delete({ where: { id: created.id } });
        // Rollback Supabase user
        await this.supabase.adminClient.auth.admin.deleteUser(
          supabaseData.user.id
        );
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }
      throw error;
    }
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findAll(query: QueryOptionsDto, user: AuthUser): Promise<PaginatedResult<any>> {
    const { page, limit, search, sort, role, healthcare, doctor, from, to } = query;

    const orgFilter = buildOrgFilter(user);
    const where: Prisma.UserWhereInput = { ...orgFilter };

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;

    if (role) {
      where.role = role as UserRole;
    }
    if (healthcare) {
      where.healthcareId = healthcare;
    }
    if (doctor) {
      where.doctorId = doctor;
    }

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

  async findById(id: string, user?: AuthUser) {
    const found = await this.prisma.user.findUnique({
      where: { id },
      include: {
        organization: true,
        healthcare: true,
        doctor: true,
        educator: true,
        deliveries: {
          include: {
            claim: true,
            assignedBy: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
        claims: { orderBy: { createdAt: "desc" } },
        hardwareSupplies: true,
        medicalEntries: { orderBy: { createdAt: "desc" } },
      },
    });

    if (user && found && !canAccessOrg(user, found.organizationId)) {
      throw new ForbiddenException("Cannot access user from different organization");
    }

    return found;
  }

  async update(id: string, dto: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    const updateData: Prisma.UserUpdateInput = {};

    // Sync email/password changes to Supabase
    if (user.supabaseId && (dto.email || dto.password)) {
      const supabaseUpdate: { email?: string; password?: string } = {};
      if (dto.email) supabaseUpdate.email = dto.email;
      if (dto.password) supabaseUpdate.password = dto.password;

      const { error } =
        await this.supabase.adminClient.auth.admin.updateUserById(
          user.supabaseId,
          supabaseUpdate
        );

      if (error) {
        throw new InternalServerErrorException(
          `Failed to update Supabase user: ${error.message}`
        );
      }
    }

    if (dto.email) {
      const exists = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (exists) throw new ConflictException("Email already in use");
      updateData.email = dto.email;
    }

    if (dto.role) {
      updateData.role = dto.role;
    }

    if (dto.organization) {
      updateData.organization = { connect: { id: dto.organization } };
    }

    if (dto.healthcare) {
      updateData.healthcare = { connect: { id: dto.healthcare } };
    }

    if (dto.fullName !== undefined) {
      updateData.fullName = dto.fullName;
    }

    if (dto.phoneNumber !== undefined) {
      updateData.phoneNumber = dto.phoneNumber;
    }

    if (dto.dni !== undefined) {
      updateData.dni = dto.dni;
    }

    if (dto.address !== undefined) {
      updateData.address = dto.address;
    }

    if (dto.birthDate) {
      updateData.birthDate = parseDate(dto.birthDate);
    }

    if (dto.doctor !== undefined) {
      if (dto.doctor) {
        updateData.doctor = { connect: { id: dto.doctor } };
      } else {
        updateData.doctor = { disconnect: true };
      }
    }

    if (dto.educator !== undefined) {
      if (dto.educator) {
        updateData.educator = { connect: { id: dto.educator } };
      } else {
        updateData.educator = { disconnect: true };
      }
    }

    if (dto.province !== undefined) {
      updateData.province = dto.province;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return { id: updated.id, email: updated.email, role: updated.role };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    // Delete from Supabase Auth first
    if (user.supabaseId) {
      const { error } =
        await this.supabase.adminClient.auth.admin.deleteUser(user.supabaseId);

      if (error) {
        throw new InternalServerErrorException(
          `Failed to delete Supabase user: ${error.message}`
        );
      }
    }

    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }



  async getUsersWithClaims(user: AuthUser) {
    const orgFilter = buildOrgFilter(user);

    const usersWithClaims = await this.prisma.claim.findMany({
      where: { user: orgFilter },
      select: { userId: true },
      distinct: ["userId"],
    });

    if (usersWithClaims.length === 0) {
      return [];
    }

    const userIds = usersWithClaims.map((c) => c.userId);

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds }, ...orgFilter },
      include: {
        healthcare: true,
        organization: true,
      },
    });

    const sortedUsers = users.sort((a, b) => {
      const aSensorNeg = (a.balanceDaysSensor ?? 0) < 0;
      const aParcheNeg = (a.balanceDaysParche ?? 0) < 0;
      const bSensorNeg = (b.balanceDaysSensor ?? 0) < 0;
      const bParcheNeg = (b.balanceDaysParche ?? 0) < 0;

      const aHasNegative = aSensorNeg || aParcheNeg;
      const bHasNegative = bSensorNeg || bParcheNeg;

      if (aHasNegative && !bHasNegative) return -1;
      if (!aHasNegative && bHasNegative) return 1;

      if (aHasNegative && bHasNegative) {
        const aMinBalance = Math.min(
          a.balanceDaysSensor ?? 0,
          a.balanceDaysParche ?? 0
        );
        const bMinBalance = Math.min(
          b.balanceDaysSensor ?? 0,
          b.balanceDaysParche ?? 0
        );
        return aMinBalance - bMinBalance;
      }

      return (a.fullName || "").localeCompare(b.fullName || "");
    });

    return sortedUsers;
  }

  async getUsers(user: AuthUser, query?: QueryOptionsDto) {
    const orgFilter = buildOrgFilter(user);
    const where: Prisma.UserWhereInput = { ...orgFilter };

    if (query?.role) {
      where.role = query.role as UserRole;
    }
    if (query?.healthcare) {
      where.healthcareId = query.healthcare;
    }
    if (query?.doctor) {
      where.doctorId = query.doctor;
    }

    return this.prisma.user.findMany({
      where,
      include: {
        healthcare: true,
        doctor: true,
      },
    });
  }

  async getPatientsOverview(user: AuthUser) {
    const orgFilter = buildOrgFilter(user);
    const where: Prisma.UserWhereInput = { role: "patient", ...orgFilter };

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const [totalPatients, patients, recentPatients] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where: { ...where, createdAt: { gte: twelveMonthsAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.user.findMany({
        where,
        select: { id: true, fullName: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
    ]);

    // Build monthly buckets for last 12 months
    const labels: string[] = [];
    const data: number[] = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(twelveMonthsAgo);
      date.setMonth(date.getMonth() + i);
      const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      labels.push(label);
      data.push(0);
    }

    for (const patient of patients) {
      const d = new Date(patient.createdAt);
      const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const idx = labels.indexOf(label);
      if (idx !== -1) {
        data[idx]++;
      }
    }

    return {
      totalPatients,
      trendline: { labels, data },
      recentPatients,
    };
  }
}
