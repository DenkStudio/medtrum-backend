import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateClaimDto } from "./dto/create-claim.dto";
import { UsersService } from "../users/users.service";
import { DeliveriesService } from "../deliveries/deliveries.service";
import { MailService } from "../mail/mail.service";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import {
  PaginatedResult,
  buildSearchFilter,
  buildOrderBy,
  buildDateRangeFilter,
} from "src/utils/paginate-query";
import { ClaimStatus, Prisma, SupplyType } from "@prisma/client";
import { CLAIM_ERROR_CODES_BY_CATEGORY } from "./constants/claim-error-codes";
import { parseDate } from "../common/helpers/date.helper";

const HARDWARE_SUPPLY_TYPES: SupplyType[] = [
  SupplyType.BASE_BOMBA_200U,
  SupplyType.BASE_BOMBA_300U,
  SupplyType.TRANSMISOR,
  SupplyType.CABLE_TRANSMISOR,
  SupplyType.PDM,
];

const SUPPLY_LABELS: Record<string, string> = {
  SENSOR: "Sensor",
  PARCHE_200U: "Reservorio Parche 200U",
  PARCHE_300U: "Reservorio Parche 300U",
  TRANSMISOR: "Transmisor",
  BASE_BOMBA_200U: "Base de Sistema de Infusión de Insulina 200U",
  BASE_BOMBA_300U: "Base de Sistema de Infusión de Insulina 300U",
  CABLE_TRANSMISOR: "Cable Transmisor",
  PDM: "PDM",
};

@Injectable()
export class ClaimsService {
  constructor(
    private prisma: PrismaService,
    private readonly users: UsersService,
    private readonly deliveries: DeliveriesService,
    private readonly mail: MailService,
  ) {}

  async create(dto: CreateClaimDto, userId: string) {
    if (!userId) {
      throw new BadRequestException("userId is required");
    }

    const hasUnreceived = await this.deliveries.hasUnreceivedReimbursements(userId);
    if (hasUnreceived) {
      throw new BadRequestException(
        "Tenés entregas de reembolso pendientes de confirmar. Confirmá la recepción antes de crear un nuevo reclamo.",
      );
    }

    if (dto.errorCode && dto.claimCategory) {
      const validCodes = CLAIM_ERROR_CODES_BY_CATEGORY[dto.claimCategory];
      if (!validCodes.includes(dto.errorCode)) {
        throw new BadRequestException(
          `Error code "${dto.errorCode}" is not valid for category "${dto.claimCategory}"`
        );
      }
    }

    const claim = await this.prisma.claim.create({
      data: {
        userId,
        supply: dto.supply,
        daysClaimed: dto.daysClaimed,
        description: dto.description,
        lotNumber: dto.lotNumber,
        claimCategory: dto.claimCategory,
        errorCode: dto.errorCode,
        photoUrl: dto.photoUrl,
        failureDate: dto.failureDate ? parseDate(dto.failureDate) : undefined,
        colocationDate: dto.colocationDate ? parseDate(dto.colocationDate) : undefined,
      },
    });

    if (
      dto.supply === SupplyType.SENSOR ||
      dto.supply === SupplyType.PARCHE_200U ||
      dto.supply === SupplyType.PARCHE_300U
    ) {
      await this.users.updateBalanceDays(userId, -(dto.daysClaimed ?? 0), dto.supply);
    }

    // Notify educator for hardware claims
    if (dto.supply && HARDWARE_SUPPLY_TYPES.includes(dto.supply)) {
      this.notifyEducator(userId, dto.supply, claim.createdAt, dto.description);
    }

    return this.prisma.claim.findUnique({
      where: { id: claim.id },
      include: { user: true },
    });
  }

  private async notifyEducator(
    userId: string,
    supply: SupplyType,
    claimDate: Date,
    description?: string,
  ) {
    try {
      const patient = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          fullName: true,
          dni: true,
          educator: {
            select: {
              user: { select: { email: true } },
              name: true,
            },
          },
        },
      });

      const educator = patient?.educator;
      const educatorEmail = educator?.user?.email;
      if (!educatorEmail || !educator) return;

      await this.mail.sendClaimEducatorNotification({
        educatorEmail,
        educatorName: educator.name,
        patientName: patient.fullName || "Paciente",
        patientDni: patient.dni ?? undefined,
        supplyName: SUPPLY_LABELS[supply] ?? supply,
        claimDate: claimDate.toISOString(),
        description,
      });
    } catch (error) {
      // Don't fail the claim creation if notification fails
    }
  }

  async findAll(query: QueryOptionsDto): Promise<PaginatedResult<any>> {
    const { page, limit, sort } = query;

    const [total, data] = await Promise.all([
      this.prisma.claim.count(),
      this.prisma.claim.findMany({
        include: { user: true },
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

  async findOne(claimId: string, userId: string) {
    const claim = await this.prisma.claim.findUnique({
      where: { id: claimId },
      select: {
        id: true,
        supply: true,
        daysClaimed: true,
        status: true,
        description: true,
        lotNumber: true,
        photoUrl: true,
        failureDate: true,
        colocationDate: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        deliveries: true,
      },
    });
    if (!claim) throw new NotFoundException("Claim not found");
    if (claim.userId !== userId) throw new NotFoundException("Claim not found");
    return claim;
  }

  async findByUserId(userId: string, query?: QueryOptionsDto) {
    const where: Prisma.ClaimWhereInput = { userId };

    if (query?.from || query?.to) {
      const dateFilter = buildDateRangeFilter(query.from, query.to);
      if (dateFilter) where.createdAt = dateFilter;
    }

    return this.prisma.claim.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  }

}
