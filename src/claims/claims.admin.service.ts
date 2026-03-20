import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { HardwareAdminService } from "../hardware/hardware.admin.service";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import {
  PaginatedResult,
  buildOrderBy,
  buildDateRangeFilter,
} from "src/utils/paginate-query";
import { ClaimStatus, HardwareStatus, Prisma, SupplyType } from "@prisma/client";
import {
  AuthUser,
  buildOrgFilter,
} from "../common/helpers/organization-filter.helper";
import { DeliveriesAdminService } from "../deliveries/deliveries.admin.service";
import { MailService } from "../mail/mail.service";
import { SupabaseService } from "../supabase/supabase.service";
import { ClaimsChartQueryDto } from "./dto/claims-chart-query.dto";
import { parseDate } from "../common/helpers/date.helper";
import {
  buildObservation,
  appendClaimObservation,
} from "../common/helpers/observation.helper";
import * as ExcelJS from "exceljs";

function isReplacementHardwareType(supply: SupplyType | null): boolean {
  if (!supply) return false;
  const replacementTypes: SupplyType[] = [
    SupplyType.TRANSMISOR,
    SupplyType.CABLE_TRANSMISOR,
    SupplyType.BASE_BOMBA_200U,
    SupplyType.BASE_BOMBA_300U,
    SupplyType.PDM,
  ];
  return replacementTypes.includes(supply);
}

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
export class ClaimsAdminService {
  constructor(
    private prisma: PrismaService,
    private readonly users: UsersService,
    private readonly deliveries: DeliveriesAdminService,
    private readonly mail: MailService,
    private readonly supabase: SupabaseService,
    private readonly hardwareService: HardwareAdminService,
  ) {}

  async findAll(query: QueryOptionsDto, user: AuthUser): Promise<PaginatedResult<any>> {
    const { page, limit, sort, status, search, from, to } = query;

    const orgFilter = buildOrgFilter(user);
    const where: Prisma.ClaimWhereInput = {};

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;

    if (user.role === "logistica") {
      const allowed: ClaimStatus[] = ["approved", "reimbursed"];
      if (status && allowed.includes(status as ClaimStatus)) {
        where.status = status as ClaimStatus;
      } else {
        where.status = { in: allowed };
      }
    } else if (status) {
      where.status = status as ClaimStatus;
    }

    const userFilter: Prisma.UserWhereInput = {};
    if (orgFilter.organizationId) {
      userFilter.organizationId = orgFilter.organizationId;
    }
    if (search) {
      userFilter.fullName = { contains: search, mode: "insensitive" };
    }
    if (Object.keys(userFilter).length > 0) {
      where.user = userFilter;
    }

    const [total, data] = await Promise.all([
      this.prisma.claim.count({ where }),
      this.prisma.claim.findMany({
        where,
        include: { user: { include: { educator: { select: { id: true, name: true } } } }, deliveries: true, resolvedBy: { select: { id: true, fullName: true, email: true } }, reimbursedBy: { select: { id: true, fullName: true, email: true } } },
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

  async exportExcel(query: QueryOptionsDto, user: AuthUser): Promise<Buffer> {
    const { sort, status, search, from, to } = query;

    const orgFilter = buildOrgFilter(user);
    const where: Prisma.ClaimWhereInput = {};

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;
    if (status) {
      where.status = status as ClaimStatus;
    }

    const userFilter: Prisma.UserWhereInput = {};
    if (orgFilter.organizationId) {
      userFilter.organizationId = orgFilter.organizationId;
    }
    if (search) {
      userFilter.fullName = { contains: search, mode: "insensitive" };
    }
    if (Object.keys(userFilter).length > 0) {
      where.user = userFilter;
    }

    const claims = await this.prisma.claim.findMany({
      where,
      include: {
        user: {
          include: {
            organization: true,
            hardwareSupplies: true,
            healthcare: true,
            doctor: true,
            educator: true,
            localidad: true,
          },
        },
        deliveries: true,
      },
      orderBy: buildOrderBy(sort),
    });

    const formatDate = (date: Date | null | undefined) => {
      if (!date) return "-";
      const d = new Date(date);
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    };

    const errorCodeLabels: Record<string, string> = {
      SENSOR_FALLA: "Falla de sensor",
      SENSOR_FALTA_ADHESIVO: "Falta de adhesivo (sensor)",
      SENSOR_DIFERENCIA_CAPILAR: "Diferencia capilar",
      SENSOR_PERDIDO: "Sensor perdido",
      SENSOR_DESCONOCIDO: "Desconocido (sensor)",
      SENSOR_SANGRADO_COLOCACION: "Sangrado en colocación",
      SENSOR_OTROS: "Otros (sensor)",
      PARCHE_FALTA_ADHESIVO: "Falta de adhesivo (parche)",
      PARCHE_ERROR: "Error de parche",
      PARCHE_OBSTRUCCION: "Obstrucción",
      PARCHE_BATERIA_AGOTADA: "Batería agotada",
      PARCHE_ERROR_CEBADO: "Error de cebado",
      PARCHE_DESACTIVADO: "Desactivado",
      PARCHE_OTROS: "Otros (parche)",
      // Transmisor
      TRANSMISOR_CONECTORES_OXIDADOS: "Conectores oxidados (transmisor)",
      TRANSMISOR_LUZ_VERDE_NO_PARPADEA: "Luz verde no parpadea",
      TRANSMISOR_PROBLEMAS_BATERIA: "Problemas de batería (transmisor)",
      TRANSMISOR_ROTURA: "Rotura (transmisor)",
      TRANSMISOR_OTROS: "Otros (transmisor)",
      // Base Bomba
      BASE_BOMBA_CONECTORES_OXIDADOS: "Conectores oxidados (base bomba)",
      BASE_BOMBA_NO_ENCASTRA: "No encastra",
      BASE_BOMBA_NO_HACE_PITIDOS: "No hace pitidos",
      BASE_BOMBA_ROTURA: "Rotura (base bomba)",
      BASE_BOMBA_OTROS: "Otros (base bomba)",
      // Cable Transmisor
      CABLE_NO_CARGA: "No carga (cable)",
      CABLE_PIN_DOBLADO: "Pin doblado",
      CABLE_OTROS: "Otros (cable)",
      // PDM
      PDM_NO_CARGA_NO_ENCIENDE: "No carga / No enciende (PDM)",
      PDM_SE_APAGA_SOLO: "Se apaga solo (PDM)",
      PDM_NO_CARGA: "No carga (PDM)",
      PDM_ROTURA: "Rotura (PDM)",
      PDM_OTROS: "Otros (PDM)",
    };

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Reclamos");

    sheet.columns = [
      { header: "Distribuidor", key: "distributor", width: 20 },
      { header: "Nombre de paciente", key: "patientName", width: 30 },
      { header: "DNI", key: "dni", width: 16 },
      { header: "Obra social", key: "obraSocial", width: 25 },
      { header: "Médico", key: "doctor", width: 25 },
      { header: "Provincia", key: "province", width: 20 },
      { header: "Localidad", key: "localidad", width: 20 },
      { header: "Insumo", key: "supply", width: 20 },
      { header: "Fecha de venta", key: "saleDate", width: 18 },
      { header: "Lote", key: "lotNumber", width: 18 },
      { header: "Serie", key: "serialNumber", width: 18 },
      { header: "Fecha de colocación", key: "colocationDate", width: 18 },
      { header: "Fecha de Falla", key: "failureDate", width: 18 },
      { header: "Días no utilizados", key: "daysClaimed", width: 20 },
      { header: "Motivo de Falla", key: "errorCode", width: 30 },
      { header: "Cantidades de reposiciones", key: "reimbursementQty", width: 28 },
      { header: "Educadora", key: "educator", width: 25 },
    ];

    sheet.getRow(1).font = { bold: true };

    for (const claim of claims) {
      let lotNumber = claim.lotNumber;
      let serialNumber: string | null = null;
      let saleDate: Date | null = null;

      if (claim.supply) {
        const hw = claim.user.hardwareSupplies?.find(
          (h) => h.type === claim.supply,
        );
        if (hw) {
          if (!lotNumber) lotNumber = hw.lotNumber;
          if (!serialNumber) serialNumber = hw.serialNumber;
          if (hw.saleDate) saleDate = hw.saleDate;
        }
      }

      const reimbursementQty = claim.deliveries
        ?.filter((d) => d.type === "claim_reimbursement")
        .reduce((sum, d) => sum + (d.quantity || 0), 0) || 0;

      sheet.addRow({
        distributor: claim.user.organization?.name ?? "-",
        patientName: claim.user.fullName ?? "-",
        dni: claim.user.dni ?? "-",
        obraSocial: (claim.user as any).healthcare?.tradeName ?? "-",
        doctor: (claim.user as any).doctor?.name ?? "-",
        province: claim.user.province ?? "-",
        localidad: (claim.user as any).localidad?.name ?? "-",
        supply: claim.supply ? (SUPPLY_LABELS[claim.supply] ?? claim.supply) : "-",
        saleDate: formatDate(saleDate),
        lotNumber: lotNumber ?? "-",
        serialNumber: serialNumber ?? "-",
        colocationDate: formatDate(claim.colocationDate),
        failureDate: formatDate(claim.failureDate),
        daysClaimed: claim.daysClaimed ?? "-",
        errorCode: claim.errorCode ? (errorCodeLabels[claim.errorCode] ?? claim.errorCode) : "-",
        reimbursementQty: reimbursementQty > 0 ? reimbursementQty : "-",
        educator: (claim.user as any).educator?.name ?? "-",
      });
    }

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer as ArrayBuffer);
  }

  async findOne(claimId: string, user?: AuthUser) {
    const claim = await this.prisma.claim.findUnique({
      where: { id: claimId },
      include: { user: { include: { localidad: true } }, deliveries: { include: { assignedBy: { select: { id: true, fullName: true, email: true } } } }, resolvedBy: { select: { id: true, fullName: true, email: true } }, reimbursedBy: { select: { id: true, fullName: true, email: true } } },
    });
    return claim;
  }

  async findByUserId(userId: string, user?: AuthUser) {
    return this.prisma.claim.findMany({
      where: { userId },
      include: { user: true, deliveries: true, resolvedBy: { select: { id: true, fullName: true, email: true } }, reimbursedBy: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async setStatus(
    id: string,
    status: ClaimStatus,
    resolutionMessage?: string,
    user?: AuthUser,
  ) {
    const claim = await this.prisma.claim.findUnique({
      where: { id },
      include: { deliveries: true },
    });
    if (!claim) throw new NotFoundException("Claim not found");

    const updateData: Prisma.ClaimUpdateInput = {
      status,
      resolvedAt: new Date(),
      ...(user && { resolvedBy: { connect: { id: user.userId } } }),
    };

    if (resolutionMessage !== undefined) {
      updateData.resolutionMessage = resolutionMessage;
    }

    if (
      status === "rejected" &&
      (claim.supply === SupplyType.SENSOR ||
        claim.supply === SupplyType.PARCHE_200U ||
        claim.supply === SupplyType.PARCHE_300U)
    ) {
      await this.users.updateBalanceDays(
        claim.userId,
        -(claim.daysClaimed ?? 0),
        claim.supply
      );
    }

    if (status === "annulled") {
      if (claim.status !== "approved" && claim.status !== "reimbursed") {
        throw new BadRequestException(
          "Solo se pueden anular reclamos aprobados o reintegrados"
        );
      }

      if (
        claim.supply === SupplyType.SENSOR ||
        claim.supply === SupplyType.PARCHE_200U ||
        claim.supply === SupplyType.PARCHE_300U
      ) {
        const totalDaysReimbursed = claim.deliveries.reduce(
          (sum, d) => sum + (d.daysReimbursed ?? 0),
          0,
        );

        const balanceDelta = (claim.daysClaimed ?? 0) - totalDaysReimbursed;
        if (balanceDelta !== 0) {
          await this.users.updateBalanceDays(
            claim.userId,
            balanceDelta,
            claim.supply,
          );
        }
      }

      await this.prisma.delivery.deleteMany({
        where: { claimId: claim.id },
      });

      updateData.balanceAfterResolution = null;
    }

    await this.prisma.claim.update({
      where: { id },
      data: updateData,
    });

    // Auto-log system observation for status change
    const statusLabels: Record<string, string> = {
      approved: "Reclamo aprobado",
      rejected: "Reclamo rechazado",
      annulled: "Reclamo anulado",
    };
    const label = statusLabels[status] || `Estado cambiado a ${status}`;
    const obsText = resolutionMessage
      ? `${label}: ${resolutionMessage}`
      : label;
    const authorRecord = user
      ? await this.prisma.user.findUnique({
          where: { id: user.userId },
          select: { fullName: true, email: true },
        })
      : null;
    const authorName = authorRecord?.fullName || authorRecord?.email || "Sistema";

    await appendClaimObservation(
      this.prisma,
      id,
      buildObservation(obsText, user?.userId || "", authorName, "system", {
        action: status,
      }),
    );

    return this.prisma.claim.findUnique({
      where: { id },
      include: {
        user: true,
        deliveries: true,
        resolvedBy: { select: { id: true, fullName: true, email: true } },
        reimbursedBy: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async reimburse(
    id: string,
    qty: number,
    daysReimbursed?: number,
    resolutionMessage?: string,
    user?: AuthUser,
    returnedLots?: { lotNumber: string; qty: number }[],
    extra?: {
      reimbursementPhotoUrl?: string;
      reimbursementPhotoUrls?: string[];
      trackingLink?: string;
      shippingDate?: string;
      deliveryPhotoUrls?: string[];
      contactName?: string;
      contactPhone?: string;
      contactEmail?: string;
      replacementSerialNumber?: string;
      replacementLotNumber?: string;
      replacementPurchaseDate?: string;
    },
  ) {
    const claim = await this.prisma.claim.findUnique({
      where: { id },
      include: { deliveries: true, user: true },
    });
    if (!claim) throw new NotFoundException("Claim not found");

    if (claim.status !== "approved") {
      throw new BadRequestException(
        "Solo se pueden reintegrar reclamos aprobados"
      );
    }

    // Validate returnedLots sum matches qty
    if (returnedLots?.length) {
      const lotsTotal = returnedLots.reduce((sum, lot) => sum + lot.qty, 0);
      if (lotsTotal !== qty) {
        throw new BadRequestException(
          `La suma de cantidades por lote (${lotsTotal}) no coincide con la cantidad total (${qty})`
        );
      }
    }

    const updateData: Prisma.ClaimUpdateInput = {
      status: "reimbursed",
      reimbursedAt: new Date(),
      ...(user && { reimbursedBy: { connect: { id: user.userId } } }),
    };

    if (resolutionMessage !== undefined) {
      updateData.resolutionMessage = resolutionMessage;
    }

    if (returnedLots?.length) {
      updateData.returnedLots = returnedLots;
    }

    if (extra?.reimbursementPhotoUrl) {
      updateData.reimbursementPhotoUrl = extra.reimbursementPhotoUrl;
    }
    if (extra?.trackingLink) {
      updateData.trackingLink = extra.trackingLink;
    }
    if (extra?.shippingDate) {
      updateData.shippingDate = new Date(extra.shippingDate);
    }

    // Fetch user name for delivery observations
    const deliveryAuthorRecord = user
      ? await this.prisma.user.findUnique({
          where: { id: user.userId },
          select: { fullName: true, email: true },
        })
      : null;
    const deliveryAuthorName = deliveryAuthorRecord?.fullName || deliveryAuthorRecord?.email || "Sistema";

    if (
      claim.supply === SupplyType.SENSOR ||
      claim.supply === SupplyType.PARCHE_200U ||
      claim.supply === SupplyType.PARCHE_300U
    ) {
      if (user) {
        if (returnedLots?.length) {
          const deliveryObs = resolutionMessage
            ? [buildObservation(resolutionMessage, user.userId, deliveryAuthorName, "system", { action: "reimbursed" })]
            : [];
          await this.prisma.delivery.create({
            data: {
              type: "claim_reimbursement",
              userId: claim.userId,
              organizationId: user.orgId ?? null,
              claimId: claim.id,
              quantity: qty,
              daysReimbursed: daysReimbursed ?? undefined,
              itemName: claim.supply ?? undefined,
              lotNumber: returnedLots as any,
              date: new Date(),
              assignedById: user.userId,
              observations: deliveryObs as any,
              internalPhotoUrls: extra?.reimbursementPhotoUrls ?? [],
              externalPhotoUrls: extra?.deliveryPhotoUrls ?? [],
              contactName: extra?.contactName,
              contactPhone: extra?.contactPhone,
              contactEmail: extra?.contactEmail,
            },
          });

          if (daysReimbursed && claim.supply) {
            await this.users.updateBalanceDays(
              claim.userId,
              daysReimbursed,
              claim.supply
            );
          }
        } else {
          await this.deliveries.create(
            {
              userId: claim.userId,
              claimId: claim.id,
              quantity: qty,
              daysReimbursed,
              itemName: claim.supply ?? undefined,
              observations: resolutionMessage,
              internalPhotoUrls: extra?.reimbursementPhotoUrls ?? [],
              externalPhotoUrls: extra?.deliveryPhotoUrls ?? [],
              contactName: extra?.contactName,
              contactPhone: extra?.contactPhone,
              contactEmail: extra?.contactEmail,
            },
            user.userId,
            user
          );
        }

        const updatedPatient = await this.prisma.user.findUnique({
          where: { id: claim.userId },
        });
        if (updatedPatient) {
          updateData.balanceAfterResolution = claim.supply === SupplyType.SENSOR
            ? updatedPatient.balanceDaysSensor ?? 0
            : updatedPatient.balanceDaysParche ?? 0;
        }
      }
    }

    // Hardware replacement logic (TRANSMISOR, CABLE_TRANSMISOR, BASE_BOMBA, PDM)
    if (
      isReplacementHardwareType(claim.supply) &&
      extra?.replacementSerialNumber &&
      user
    ) {
      const supply = claim.supply!;

      // Determine which types to retire based on the claimed supply
      let typesToRetire: SupplyType[];
      if (supply === SupplyType.TRANSMISOR || supply === SupplyType.CABLE_TRANSMISOR) {
        typesToRetire = [SupplyType.TRANSMISOR, SupplyType.CABLE_TRANSMISOR];
      } else if (supply === SupplyType.BASE_BOMBA_200U || supply === SupplyType.BASE_BOMBA_300U) {
        typesToRetire = [supply];
      } else {
        // PDM
        typesToRetire = [SupplyType.PDM];
      }

      // Retire old hardware
      await this.prisma.hardwareSupply.updateMany({
        where: {
          userId: claim.userId,
          type: { in: typesToRetire },
          status: HardwareStatus.active,
        },
        data: { status: HardwareStatus.retired },
      });

      // Create new replacement hardware
      if (supply === SupplyType.TRANSMISOR || supply === SupplyType.CABLE_TRANSMISOR) {
        // Kit: create TRANSMISOR (auto-creates CABLE_TRANSMISOR via hardwareService.create)
        await this.hardwareService.create(
          {
            type: SupplyType.TRANSMISOR,
            serialNumber: extra.replacementSerialNumber,
            lotNumber: extra.replacementLotNumber,
            userId: claim.userId,
            saleDate: extra.replacementPurchaseDate,
          },
          user.userId,
          claim.user.organizationId ?? undefined,
        );
      } else if (supply === SupplyType.BASE_BOMBA_200U || supply === SupplyType.BASE_BOMBA_300U) {
        // Base bomba only (no pdmSerialNumber → won't create PDM)
        await this.hardwareService.create(
          {
            type: supply,
            serialNumber: extra.replacementSerialNumber,
            lotNumber: extra.replacementLotNumber,
            userId: claim.userId,
            saleDate: extra.replacementPurchaseDate,
          },
          user.userId,
          claim.user.organizationId ?? undefined,
        );
      } else if (supply === SupplyType.PDM) {
        // PDM: create directly (not a primary type in hardwareService.create)
        await this.prisma.hardwareSupply.create({
          data: {
            type: SupplyType.PDM,
            serialNumber: extra.replacementSerialNumber,
            lotNumber: extra.replacementLotNumber,
            userId: claim.userId,
            organizationId: claim.user.organizationId ?? undefined,
            assignedDate: new Date(),
            saleDate: extra.replacementPurchaseDate
              ? parseDate(extra.replacementPurchaseDate)
              : undefined,
          },
        });
      }

      // Create delivery record for hardware reimbursement
      const deliveryObs = resolutionMessage
        ? [buildObservation(resolutionMessage, user.userId, deliveryAuthorName, "system", { action: "reimbursed" })]
        : [];
      await this.prisma.delivery.create({
        data: {
          type: "claim_reimbursement",
          userId: claim.userId,
          organizationId: user.orgId ?? null,
          claimId: claim.id,
          quantity: 1,
          itemName: claim.supply ?? undefined,
          date: new Date(),
          assignedById: user.userId,
          observations: deliveryObs as any,
          internalPhotoUrls: extra?.reimbursementPhotoUrls ?? [],
          externalPhotoUrls: extra?.deliveryPhotoUrls ?? [],
          contactName: extra?.contactName,
          contactPhone: extra?.contactPhone,
          contactEmail: extra?.contactEmail,
        },
      });
    }

    await this.prisma.claim.update({
      where: { id },
      data: updateData,
    });

    // Auto-log system observation for reimbursement
    const reimburseAuthorRecord = user
      ? await this.prisma.user.findUnique({
          where: { id: user.userId },
          select: { fullName: true, email: true },
        })
      : null;
    const reimburseAuthorName = reimburseAuthorRecord?.fullName || reimburseAuthorRecord?.email || "Sistema";
    const reimburseText = resolutionMessage
      ? `Reclamo reintegrado (cantidad: ${qty}): ${resolutionMessage}`
      : `Reclamo reintegrado (cantidad: ${qty})`;
    await appendClaimObservation(
      this.prisma,
      id,
      buildObservation(reimburseText, user?.userId || "", reimburseAuthorName, "system", {
        action: "reimbursed",
      }),
    );

    // Send reimbursement email to patient
    if (claim.user?.email) {
      const supplyLabel = claim.supply
        ? (SUPPLY_LABELS[claim.supply] ?? claim.supply)
        : "Insumo";
      this.mail.sendReimbursementNotification({
        patientEmail: claim.user.email,
        patientName: claim.user.fullName || "",
        supplyName: supplyLabel,
        quantity: qty,
        trackingLink: extra?.trackingLink,
        shippingDate: extra?.shippingDate,
      });
    }

    return this.prisma.claim.findUnique({
      where: { id },
      include: {
        user: true,
        deliveries: true,
        resolvedBy: { select: { id: true, fullName: true, email: true } },
        reimbursedBy: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async addObservation(id: string, text: string, user: AuthUser) {
    const claim = await this.prisma.claim.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!claim) throw new NotFoundException("Claim not found");

    const author = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { fullName: true, email: true },
    });

    const currentObservations = (claim.observations as any[]) || [];
    const newObservation = {
      text,
      date: new Date().toISOString(),
      authorId: user.userId,
      authorName: author?.fullName || author?.email || user.userId,
      type: "manual",
    };

    return this.prisma.claim.update({
      where: { id },
      data: { observations: [...currentObservations, newObservation] },
      include: { user: true, deliveries: true, resolvedBy: { select: { id: true, fullName: true, email: true } }, reimbursedBy: { select: { id: true, fullName: true, email: true } } },
    });
  }

  async getReimbursementPhotoSignedUrl(claimId: string) {
    const claim = await this.prisma.claim.findUnique({
      where: { id: claimId },
      select: { reimbursementPhotoUrl: true },
    });
    if (!claim) throw new NotFoundException("Claim not found");
    if (!claim.reimbursementPhotoUrl) return { url: null };

    const { data, error } = await this.supabase.adminClient.storage
      .from("reintegros")
      .createSignedUrl(claim.reimbursementPhotoUrl, 3600);

    if (error) {
      throw new BadRequestException(`Error generating signed URL: ${error.message}`);
    }

    return { url: data.signedUrl };
  }

  private buildDateRange(startDate: string, endDate: string) {
    const start = parseDate(startDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = parseDate(endDate);
    end.setUTCHours(23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  async getChartData(query: ClaimsChartQueryDto, user: AuthUser) {
    const { startDate, endDate } = query;
    const orgFilter = buildOrgFilter(user);

    const where: Prisma.ClaimWhereInput = {
      createdAt: this.buildDateRange(startDate, endDate),
    };

    if (orgFilter.organizationId) {
      where.user = { organizationId: orgFilter.organizationId };
    }

    const claims = await this.prisma.claim.findMany({
      where,
      select: { supply: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // Collect unique supplies and build monthly buckets
    const suppliesSet = new Set<string>();
    const monthlyMap = new Map<string, Map<string, number>>();

    for (const claim of claims) {
      const supply = claim.supply || "Sin producto";
      suppliesSet.add(supply);

      const date = new Date(claim.createdAt);
      const monthKey = `${String(date.getMonth() + 1).padStart(2, "0")}-01-${date.getFullYear()}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, new Map());
      }
      const monthBucket = monthlyMap.get(monthKey)!;
      monthBucket.set(supply, (monthBucket.get(supply) || 0) + 1);
    }

    const labels = Array.from(monthlyMap.keys());
    const supplies = Array.from(suppliesSet);

    const colors = [
      { bg: "#4F46E5", hover: "#4338CA" },
      { bg: "#7C3AED", hover: "#6D28D9" },
      { bg: "#A78BFA", hover: "#8B5CF6" },
      { bg: "#C4B5FD", hover: "#A78BFA" },
      { bg: "#DDD6FE", hover: "#C4B5FD" },
      { bg: "#EDE9FE", hover: "#DDD6FE" },
    ];

    const datasets = supplies.map((supply, i) => {
      const color = colors[i % colors.length];
      return {
        label: SUPPLY_LABELS[supply] ?? supply,
        data: labels.map((label) => monthlyMap.get(label)?.get(supply) || 0),
        backgroundColor: color.bg,
        hoverBackgroundColor: color.hover,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      };
    });

    return { labels, datasets };
  }

  async getClaimsByUserChart(query: ClaimsChartQueryDto, user: AuthUser) {
    const { startDate, endDate } = query;
    const orgFilter = buildOrgFilter(user);

    const userWhere: Prisma.UserWhereInput = { role: "patient" };
    if (orgFilter.organizationId) {
      userWhere.organizationId = orgFilter.organizationId;
    }

    const patients = await this.prisma.user.findMany({
      where: userWhere,
      select: {
        id: true,
        claims: {
          where: {
            createdAt: this.buildDateRange(startDate, endDate),
          },
          select: { id: true },
        },
      },
    });

    // Group users by claim count
    const countMap = new Map<number, number>();
    for (const patient of patients) {
      const claimCount = patient.claims.length;
      countMap.set(claimCount, (countMap.get(claimCount) || 0) + 1);
    }

    // Sort by claim count ascending
    const sortedEntries = Array.from(countMap.entries()).sort(
      (a, b) => a[0] - b[0],
    );

    const labels = sortedEntries.map(([count]) =>
      count === 1 ? "1 reclamo" : `${count} reclamos`,
    );
    const data = sortedEntries.map(([, users]) => users);

    const palette = [
      "#22C55E", "#3B82F6", "#F59E0B", "#F43F5E",
      "#8B5CF6", "#EC4899", "#14B8A6", "#F97316",
    ];
    const hoverPalette = [
      "#16A34A", "#2563EB", "#D97706", "#E11D48",
      "#7C3AED", "#DB2777", "#0D9488", "#EA580C",
    ];

    return {
      labels,
      datasets: [
        {
          label: "Usuarios",
          data,
          backgroundColor: labels.map((_, i) => palette[i % palette.length]),
          hoverBackgroundColor: labels.map(
            (_, i) => hoverPalette[i % hoverPalette.length],
          ),
          borderWidth: 0,
        },
      ],
    };
  }
}
