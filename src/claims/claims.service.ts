import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateClaimDto } from "./dto/create-claim.dto";
import { UsersService } from "../users/users.service";
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

@Injectable()
export class ClaimsService {
  constructor(
    private prisma: PrismaService,
    private readonly users: UsersService
  ) {}

  async create(dto: CreateClaimDto, userId: string) {
    if (!userId) {
      throw new BadRequestException("userId is required");
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
        needsReplacement: dto.needsReplacement ?? false,
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

    return this.prisma.claim.findUnique({
      where: { id: claim.id },
      include: { user: true },
    });
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
        needChange: true,
        lotNumber: true,
        needsReplacement: true,
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

  async setStatus(id: string, status: ClaimStatus) {
    const claim = await this.prisma.claim.findUnique({ where: { id } });
    if (!claim) throw new NotFoundException("Claim not found");

    await this.prisma.claim.update({
      where: { id },
      data: { status },
    });

    if (
      status === "approved" &&
      (claim.supply === SupplyType.SENSOR ||
        claim.supply === SupplyType.PARCHE_200U ||
        claim.supply === SupplyType.PARCHE_300U)
    ) {
      await this.users.updateBalanceDays(
        claim.userId,
        claim.daysClaimed ?? 0,
        claim.supply
      );
    }

    return this.prisma.claim.findUnique({
      where: { id },
      include: { user: true },
    });
  }
}
