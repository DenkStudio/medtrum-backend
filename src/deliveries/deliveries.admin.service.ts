import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDeliveryDto } from "./dto/create-delivery.dto";
import { DeliveryType, Prisma, SupplyType } from "@prisma/client";
import { UsersService } from "../users/users.service";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import {
  PaginatedResult,
  buildOrderBy,
  buildDateRangeFilter,
} from "src/utils/paginate-query";
import {
  AuthUser,
  buildOrgFilter,
  getCreateOrgId,
} from "../common/helpers/organization-filter.helper";
import { parseDate } from "../common/helpers/date.helper";

@Injectable()
export class DeliveriesAdminService {
  constructor(
    private prisma: PrismaService,
    private users: UsersService
  ) {}

  async create(dto: CreateDeliveryDto, assignedByUserId: string, user: AuthUser) {
    const organizationId = getCreateOrgId(user, dto.organizationId);
    const deliveryDate = dto.date ? parseDate(dto.date) : new Date();
    const type = dto.claimId
      ? DeliveryType.claim_reimbursement
      : DeliveryType.supply_delivery;

    const patient = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!patient) throw new NotFoundException("User not found");

    const delivery = await this.prisma.delivery.create({
      data: {
        type,
        userId: dto.userId,
        organizationId,
        claimId: dto.claimId,
        quantity: dto.quantity ?? 0,
        daysReimbursed: dto.daysReimbursed,
        itemName: dto.itemName,
        date: deliveryDate,
        assignedById: assignedByUserId,
        observations: dto.observations,
      },
    });

    if (dto.daysReimbursed && dto.itemName) {
      if (
        dto.itemName === SupplyType.SENSOR ||
        dto.itemName === SupplyType.PARCHE_200U ||
        dto.itemName === SupplyType.PARCHE_300U
      ) {
        await this.users.updateBalanceDays(
          dto.userId,
          dto.daysReimbursed,
          dto.itemName
        );
      }
    }

    return delivery;
  }

  async findAll(query: QueryOptionsDto, user: AuthUser): Promise<PaginatedResult<any>> {
    const { page, limit, sort, type, search, from, to } = query;

    const orgFilter = buildOrgFilter(user);
    const where: Prisma.DeliveryWhereInput = {};

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;
    const userFilter: Prisma.UserWhereInput = {};

    if (orgFilter.organizationId) {
      where.organizationId = orgFilter.organizationId;
    }
    if (type) {
      where.type = type as DeliveryType;
    }
    if (search) {
      userFilter.fullName = { contains: search, mode: "insensitive" };
    }
    if (Object.keys(userFilter).length > 0) {
      where.user = userFilter;
    }

    const [total, data] = await Promise.all([
      this.prisma.delivery.count({ where }),
      this.prisma.delivery.findMany({
        where,
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          claim: true,
          assignedBy: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: buildOrderBy(sort) || { createdAt: "desc" },
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
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        claim: true,
        assignedBy: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!delivery) throw new NotFoundException("Delivery not found");
    return delivery;
  }

  async findByUserId(userId: string, user: AuthUser) {
    const orgFilter = buildOrgFilter(user);
    const where: Prisma.DeliveryWhereInput = { userId };

    if (orgFilter.organizationId) {
      where.organizationId = orgFilter.organizationId;
    }

    return this.prisma.delivery.findMany({
      where,
      include: {
        claim: true,
        assignedBy: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
