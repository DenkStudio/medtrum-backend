import {
  Injectable,
  ForbiddenException,
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
  canAccessOrg,
  getCreateOrgId,
} from "../common/helpers/organization-filter.helper";
import { parseDate } from "../common/helpers/date.helper";
import { MailService } from "../mail/mail.service";
import { SupabaseService } from "../supabase/supabase.service";
import { BadRequestException } from "@nestjs/common";
import {
  buildObservation,
  appendDeliveryObservation,
  appendClaimObservation,
} from "../common/helpers/observation.helper";

@Injectable()
export class DeliveriesAdminService {
  constructor(
    private prisma: PrismaService,
    private users: UsersService,
    private mail: MailService,
    private supabase: SupabaseService,
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

    if (!canAccessOrg(user, patient.organizationId)) {
      throw new ForbiddenException("Cannot create delivery for user from different organization");
    }

    // Convert string observations to JSON array format
    const observationsArray = dto.observations
      ? [buildObservation(dto.observations, assignedByUserId, "Sistema", "system")]
      : [];

    const delivery = await this.prisma.delivery.create({
      data: {
        type,
        userId: dto.userId,
        organizationId,
        claimId: dto.claimId,
        quantity: dto.quantity ?? 0,
        daysReimbursed: dto.daysReimbursed,
        itemName: dto.itemName,
        lotNumber: dto.lotNumber,
        trackingNumber: dto.trackingNumber,
        courierName: dto.courierName,
        date: deliveryDate,
        assignedById: assignedByUserId,
        observations: observationsArray as any,
        photoUrl: dto.photoUrl,
      },
    });

    if (type === DeliveryType.supply_delivery && patient.email && dto.itemName) {
      this.mail.sendSupplyDeliveryNotification({
        patientEmail: patient.email,
        patientName: patient.fullName ?? undefined,
        supplyName: dto.itemName,
        quantity: dto.quantity ?? 0,
        date: deliveryDate.toISOString(),
        observations: dto.observations,
      });
    }

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

  async findOne(id: string, user: AuthUser) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        claim: true,
        assignedBy: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!delivery) throw new NotFoundException("Delivery not found");

    if (!canAccessOrg(user, delivery.organizationId)) {
      throw new ForbiddenException("Cannot access delivery from different organization");
    }

    return delivery;
  }

  async getDeliveryPhotoSignedUrl(deliveryId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      select: { photoUrl: true },
    });
    if (!delivery) throw new NotFoundException("Delivery not found");
    if (!delivery.photoUrl) return { url: null };

    const { data, error } = await this.supabase.adminClient.storage
      .from("entregas")
      .createSignedUrl(delivery.photoUrl, 3600);

    if (error) {
      throw new BadRequestException(`Error generating signed URL: ${error.message}`);
    }

    return { url: data.signedUrl };
  }

  async addObservation(id: string, text: string, user: AuthUser) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      select: { id: true, claimId: true, organizationId: true },
    });
    if (!delivery) throw new NotFoundException("Delivery not found");

    if (!canAccessOrg(user, delivery.organizationId)) {
      throw new ForbiddenException("Cannot access delivery from different organization");
    }

    const author = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { fullName: true, email: true },
    });
    const authorName = author?.fullName || author?.email || user.userId;

    const observation = buildObservation(text, user.userId, authorName, "manual");

    await appendDeliveryObservation(this.prisma, id, observation);

    // Cross-link: if delivery has a claim, also append to the claim
    if (delivery.claimId) {
      const crossObs = buildObservation(
        text,
        user.userId,
        authorName,
        "cross_delivery",
        { sourceId: id, sourceType: "delivery" },
      );
      await appendClaimObservation(this.prisma, delivery.claimId, crossObs);
    }

    return this.prisma.delivery.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        claim: true,
        assignedBy: { select: { id: true, fullName: true, email: true } },
      },
    });
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
