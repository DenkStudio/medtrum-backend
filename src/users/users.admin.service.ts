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
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserRole, Prisma } from "@prisma/client";
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
import { MailService } from "../mail/mail.service";

@Injectable()
export class UsersAdminService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => HardwareAdminService))
    private hardwareService: HardwareAdminService,
    private supabase: SupabaseService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async invite(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    const redirectTo = `${this.config.get("FRONTEND_URL")}/update-password`;

    const { data, error } =
      await this.supabase.adminClient.auth.admin.generateLink({
        type: "invite",
        email: user.email,
        options: { redirectTo },
      });

    if (error) {
      throw new BadRequestException(error.message);
    }

    this.mail.sendInvitationEmail({
      email: user.email,
      name: user.fullName ?? undefined,
      actionLink: data.properties.action_link,
    });

    return { message: "Invitación enviada", data };
  }

  async create(dto: CreateUserDto, createdByUserId?: string) {
    // If minor has familyContactEmail, use that as the account email (for login)
    const accountEmail = dto.familyContactEmail || dto.email;

    const exists = await this.prisma.user.findUnique({
      where: { email: accountEmail },
    });
    if (exists) throw new ConflictException("Email already in use");

    let supabaseData: any;

    if (dto.sendInvite) {
      const redirectTo = `${this.config.get("FRONTEND_URL")}/update-password`;
      const { data, error } =
        await this.supabase.adminClient.auth.admin.generateLink({
          type: "invite",
          email: accountEmail,
          options: { redirectTo },
        });

      if (error) {
        throw new BadRequestException(error.message);
      }
      supabaseData = data;

      this.mail.sendInvitationEmail({
        email: accountEmail,
        name: dto.fullName,
        actionLink: data.properties.action_link,
      });
    } else {
      // Create user with password
      const { data, error } =
        await this.supabase.adminClient.auth.admin.createUser({
          email: accountEmail,
          password: dto.password,
          email_confirm: true,
        });

      if (error) {
        throw new InternalServerErrorException(
          `Failed to create Supabase user: ${error.message}`
        );
      }
      supabaseData = data;

      if (dto.role === UserRole.patient) {
        this.mail.sendWelcomeEmail({ email: accountEmail, name: dto.fullName });
      }
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
        email: accountEmail,
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
        familyContactName: dto.familyContactName,
        familyContactEmail: dto.familyContactEmail,
        familyContactPhone: dto.familyContactPhone,
        familyContactRelationship: dto.familyContactRelationship,
        localidadId: dto.localidad,
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

        const hardwarePromises = dto.hardwares.map((hardware) =>
          this.hardwareService
            .create(
              {
                type: hardware.type,
                serialNumber: hardware.serialNumber,
                lotNumber: hardware.lotNumber,
                saleDate: hardware.saleDate,
                placementDate: hardware.placementDate,
                userId: created.id,
                ...(hardware.pdmSerialNumber && { pdmSerialNumber: hardware.pdmSerialNumber }),
              },
              createdBy,
              organizationId
            )
            .then((hw) => {
              createdHardwareIds.push(hw.id);
              return hw;
            }),
        );

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

  async patientsOverview(user: AuthUser) {
    const orgFilter = buildOrgFilter(user);
    const where: Prisma.UserWhereInput = { ...orgFilter, role: "patient" };

    const totalPatients = await this.prisma.user.count({ where });

    const recentPatients = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, fullName: true, createdAt: true },
    });

    // Trendline: patients created per month (last 12 months)
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const patientsInRange = await this.prisma.user.findMany({
      where: { ...where, createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const monthlyMap = new Map<string, number>();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, 0);
    }
    for (const p of patientsInRange) {
      const d = new Date(p.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyMap.has(key)) {
        monthlyMap.set(key, monthlyMap.get(key)! + 1);
      }
    }

    return {
      totalPatients,
      recentPatients,
      trendline: {
        labels: Array.from(monthlyMap.keys()),
        data: Array.from(monthlyMap.values()),
      },
    };
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
        include: {
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

  async findById(id: string, user?: AuthUser) {
    const found = await this.prisma.user.findUnique({
      where: { id },
      include: {
        organization: true,
        healthcare: true,
        doctor: true,
        educator: true,
        localidad: true,
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

  async update(id: string, dto: UpdateUserDto, authUser: AuthUser) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    if (!canAccessOrg(authUser, user.organizationId)) {
      throw new ForbiddenException("Cannot update user from different organization");
    }

    const updateData: Prisma.UserUpdateInput = {};

    // Check local DB for email duplicates BEFORE updating Supabase
    if (dto.email) {
      const exists = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (exists) throw new ConflictException("Email already in use");
      updateData.email = dto.email;
    }

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

    if (dto.localidad !== undefined) {
      if (dto.localidad) {
        updateData.localidad = { connect: { id: dto.localidad } };
      } else {
        updateData.localidad = { disconnect: true };
      }
    }

    if (dto.familyContactName !== undefined) {
      updateData.familyContactName = dto.familyContactName;
    }

    if (dto.familyContactEmail !== undefined) {
      updateData.familyContactEmail = dto.familyContactEmail;
    }

    if (dto.familyContactPhone !== undefined) {
      updateData.familyContactPhone = dto.familyContactPhone;
    }

    if (dto.familyContactRelationship !== undefined) {
      updateData.familyContactRelationship = dto.familyContactRelationship;
    }

    if (dto.balanceDaysSensor !== undefined) {
      updateData.balanceDaysSensor = dto.balanceDaysSensor;
    }

    if (dto.balanceDaysParche !== undefined) {
      updateData.balanceDaysParche = dto.balanceDaysParche;
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
    if (query?.from || query?.to) {
      const dateFilter = buildDateRangeFilter(query.from, query.to);
      if (dateFilter) where.createdAt = dateFilter;
    }
    if (query?.search) {
      const searchFilter = buildSearchFilter(query.search, ["email", "fullName"]);
      if (searchFilter) where.AND = [searchFilter];
    }

    return this.prisma.user.findMany({
      where,
      include: {
        healthcare: true,
        doctor: true,
        localidad: true,
        organization: true,
        educator: true,
        hardwareSupplies: { where: { status: "active" }, orderBy: { type: "asc" } },
      },
      orderBy: buildOrderBy(query?.sort),
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
