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
        doctor: (claim.user as any).doctor ? `${(claim.user as any).doctor.lastName} ${(claim.user as any).doctor.firstName}` : "-",
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

    if (claim && user?.orgId && claim.user?.organizationId !== user.orgId) {
      throw new ForbiddenException("No tiene acceso a este reclamo");
    }

    return claim;
  }

  async findByUserId(userId: string, user?: AuthUser) {
    if (user?.orgId) {
      const targetUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { organizationId: true },
      });
      if (targetUser && targetUser.organizationId !== user.orgId) {
        throw new ForbiddenException("No tiene acceso a los reclamos de este usuario");
      }
    }

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

    // Validate status transitions
    const allowedTransitions: Record<string, ClaimStatus[]> = {
      pending: ["approved", "rejected"],
      approved: ["reimbursed", "annulled"],
      reimbursed: ["received", "annulled"],
    };
    const allowed = allowedTransitions[claim.status];
    if (!allowed || !allowed.includes(status)) {
      throw new BadRequestException(
        `No se puede cambiar el estado de "${claim.status}" a "${status}"`
      );
    }

    const terminalStatuses: ClaimStatus[] = ["approved", "rejected", "annulled", "reimbursed"];
    const isTerminal = terminalStatuses.includes(status);

    await this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.ClaimUpdateInput = {
        status,
        ...(isTerminal && { resolvedAt: new Date() }),
        ...(isTerminal && user && { resolvedBy: { connect: { id: user.userId } } }),
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
        const fieldName = claim.supply === SupplyType.SENSOR
          ? "balanceDaysSensor"
          : "balanceDaysParche";
        await tx.user.update({
          where: { id: claim.userId },
          data: { [fieldName]: { increment: +(claim.daysClaimed ?? 0) } },
        });
      }

      if (status === "annulled") {
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
            const fieldName = claim.supply === SupplyType.SENSOR
              ? "balanceDaysSensor"
              : "balanceDaysParche";
            await tx.user.update({
              where: { id: claim.userId },
              data: { [fieldName]: { increment: balanceDelta } },
            });
          }
        }

        // Reverse hardware replacements if the claim was reimbursed with hardware
        if (
          claim.status === "reimbursed" &&
          isReplacementHardwareType(claim.supply)
        ) {
          // Find the replacement serial number from the delivery
          const hwDelivery = claim.deliveries.find(
            (d) => d.type === "claim_reimbursement" && d.lotNumber,
          );
          if (hwDelivery) {
            const lotData = hwDelivery.lotNumber as any;
            const replacementSerial = lotData?.serialNumber;

            if (replacementSerial) {
              // Determine the type of hardware that was created
              let createdType = claim.supply!;
              if (createdType === SupplyType.CABLE_TRANSMISOR) {
                createdType = SupplyType.TRANSMISOR;
              }

              // Find the replacement hardware
              const replacementHw = await tx.hardwareSupply.findFirst({
                where: {
                  serialNumber: replacementSerial,
                  type: createdType,
                  userId: claim.userId,
                },
              });

              if (replacementHw) {
                // Delete linked items (CABLE_TRANSMISOR linked to TRANSMISOR, etc.)
                await tx.hardwareSupply.deleteMany({
                  where: { linkedHardwareId: replacementHw.id },
                });

                // Delete the replacement hardware itself
                await tx.hardwareSupply.delete({
                  where: { id: replacementHw.id },
                });
              }
            }

            // Re-activate the most recently retired hardware of the same type(s)
            let typesToReactivate: SupplyType[];
            if (
              claim.supply === SupplyType.TRANSMISOR ||
              claim.supply === SupplyType.CABLE_TRANSMISOR
            ) {
              typesToReactivate = [SupplyType.TRANSMISOR, SupplyType.CABLE_TRANSMISOR];
            } else if (
              claim.supply === SupplyType.BASE_BOMBA_200U ||
              claim.supply === SupplyType.BASE_BOMBA_300U
            ) {
              typesToReactivate = [claim.supply];
            } else {
              typesToReactivate = [SupplyType.PDM];
            }

            // Only reactivate hardware retired around the time the claim was resolved
            const reactivateWhere: Prisma.HardwareSupplyWhereInput = {
              userId: claim.userId,
              type: { in: typesToReactivate },
              status: HardwareStatus.retired,
            };
            if (claim.resolvedAt) {
              const retiredAfter = new Date(claim.resolvedAt.getTime() - 60_000);
              const retiredBefore = new Date(claim.resolvedAt.getTime() + 60_000);
              reactivateWhere.updatedAt = { gte: retiredAfter, lte: retiredBefore };
            }

            await tx.hardwareSupply.updateMany({
              where: reactivateWhere,
              data: { status: HardwareStatus.active },
            });
          }
        }

        await tx.delivery.deleteMany({
          where: { claimId: claim.id },
        });

        updateData.balanceAfterResolution = null;
      }

      await tx.claim.update({
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
        ? await tx.user.findUnique({
            where: { id: user.userId },
            select: { fullName: true, email: true },
          })
        : null;
      const authorName = authorRecord?.fullName || authorRecord?.email || "Sistema";

      await appendClaimObservation(
        tx as any,
        id,
        buildObservation(obsText, user?.userId || "", authorName, "system", {
          action: status,
        }),
      );
    }, { timeout: 30000 });

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

    await this.prisma.$transaction(async (tx) => {
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
        ? await tx.user.findUnique({
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
            await tx.delivery.create({
              data: {
                type: "claim_reimbursement",
                userId: claim.userId,
                organizationId: claim.user?.organizationId ?? null,
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
              const fieldName = claim.supply === SupplyType.SENSOR
                ? "balanceDaysSensor"
                : "balanceDaysParche";
              await tx.user.update({
                where: { id: claim.userId },
                data: { [fieldName]: { increment: daysReimbursed } },
              });
            }
          } else {
            // Build delivery observations
            const obsArray = resolutionMessage
              ? [buildObservation(resolutionMessage, user.userId, "Sistema", "system")]
              : [];

            await tx.delivery.create({
              data: {
                type: "claim_reimbursement",
                userId: claim.userId,
                organizationId: claim.user?.organizationId ?? null,
                claimId: claim.id,
                quantity: qty,
                daysReimbursed,
                itemName: claim.supply ?? undefined,
                date: new Date(),
                assignedById: user.userId,
                observations: obsArray as any,
                internalPhotoUrls: extra?.reimbursementPhotoUrls ?? [],
                externalPhotoUrls: extra?.deliveryPhotoUrls ?? [],
                contactName: extra?.contactName,
                contactPhone: extra?.contactPhone,
                contactEmail: extra?.contactEmail,
              },
            });

            if (daysReimbursed && claim.supply) {
              if (
                claim.supply === SupplyType.SENSOR ||
                claim.supply === SupplyType.PARCHE_200U ||
                claim.supply === SupplyType.PARCHE_300U
              ) {
                const fieldName = claim.supply === SupplyType.SENSOR
                  ? "balanceDaysSensor"
                  : "balanceDaysParche";
                await tx.user.update({
                  where: { id: claim.userId },
                  data: { [fieldName]: { increment: daysReimbursed } },
                });
              }
            }
          }

          const updatedPatient = await tx.user.findUnique({
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
        await tx.hardwareSupply.updateMany({
          where: {
            userId: claim.userId,
            type: { in: typesToRetire },
            status: HardwareStatus.active,
          },
          data: { status: HardwareStatus.retired },
        });

        // Create new replacement hardware
        if (supply === SupplyType.TRANSMISOR || supply === SupplyType.CABLE_TRANSMISOR) {
          // Create TRANSMISOR directly inside the transaction
          const newTransmisor = await tx.hardwareSupply.create({
            data: {
              type: SupplyType.TRANSMISOR,
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

          // Auto-create companion CABLE_TRANSMISOR linked to the TRANSMISOR
          const cableExists = await tx.hardwareSupply.findFirst({
            where: {
              serialNumber: extra.replacementSerialNumber,
              type: SupplyType.CABLE_TRANSMISOR,
            },
          });

          if (!cableExists) {
            await tx.hardwareSupply.create({
              data: {
                type: SupplyType.CABLE_TRANSMISOR,
                serialNumber: extra.replacementSerialNumber,
                lotNumber: extra.replacementLotNumber,
                userId: claim.userId,
                organizationId: claim.user.organizationId ?? undefined,
                assignedDate: new Date(),
                saleDate: extra.replacementPurchaseDate
                  ? parseDate(extra.replacementPurchaseDate)
                  : undefined,
                linkedHardwareId: newTransmisor.id,
              },
            });
          }
        } else if (supply === SupplyType.BASE_BOMBA_200U || supply === SupplyType.BASE_BOMBA_300U) {
          // Base bomba only — create directly to avoid auto-creating/replacing PDM
          await tx.hardwareSupply.create({
            data: {
              type: supply,
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
        } else if (supply === SupplyType.PDM) {
          // PDM: create directly (not a primary type in hardwareService.create)
          await tx.hardwareSupply.create({
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
        await tx.delivery.create({
          data: {
            type: "claim_reimbursement",
            userId: claim.userId,
            organizationId: claim.user?.organizationId ?? null,
            claimId: claim.id,
            quantity: 1,
            itemName: claim.supply ?? undefined,
            lotNumber: {
              lotNumber: extra.replacementLotNumber,
              serialNumber: extra.replacementSerialNumber,
            } as any,
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

      await tx.claim.update({
        where: { id },
        data: updateData,
      });

      // Auto-log system observation for reimbursement
      const reimburseAuthorName = deliveryAuthorRecord?.fullName || deliveryAuthorRecord?.email || "Sistema";
      const reimburseText = resolutionMessage
        ? `Reclamo reintegrado (cantidad: ${qty}): ${resolutionMessage}`
        : `Reclamo reintegrado (cantidad: ${qty})`;
      await appendClaimObservation(
        tx as any,
        id,
        buildObservation(reimburseText, user?.userId || "", reimburseAuthorName, "system", {
          action: "reimbursed",
        }),
      );
    }, { timeout: 30000 });

    // Send reimbursement email to patient (outside transaction — not a DB operation)
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
    const { startDate, endDate, organizationId } = query;
    const orgFilter = buildOrgFilter(user);

    const where: Prisma.ClaimWhereInput = {
      createdAt: this.buildDateRange(startDate, endDate),
    };

    // Superadmin can filter by specific org via query param
    const effectiveOrgId = orgFilter.organizationId || organizationId;
    if (effectiveOrgId) {
      where.user = { organizationId: effectiveOrgId };
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
    const { startDate, endDate, organizationId } = query;
    const orgFilter = buildOrgFilter(user);

    const userWhere: Prisma.UserWhereInput = { role: "patient" };
    const effectiveOrgId = orgFilter.organizationId || organizationId;
    if (effectiveOrgId) {
      userWhere.organizationId = effectiveOrgId;
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
