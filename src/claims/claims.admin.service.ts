import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import {
  PaginatedResult,
  buildOrderBy,
  buildDateRangeFilter,
} from "src/utils/paginate-query";
import { ClaimStatus, Prisma, SupplyType } from "@prisma/client";
import {
  AuthUser,
  buildOrgFilter,
} from "../common/helpers/organization-filter.helper";
import { DeliveriesAdminService } from "../deliveries/deliveries.admin.service";
import { ClaimsChartQueryDto } from "./dto/claims-chart-query.dto";
import { parseDate } from "../common/helpers/date.helper";
import * as ExcelJS from "exceljs";

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
    private readonly deliveries: DeliveriesAdminService
  ) {}

  async findAll(query: QueryOptionsDto, user: AuthUser): Promise<PaginatedResult<any>> {
    const { page, limit, sort, status, search, from, to } = query;

    const orgFilter = buildOrgFilter(user);
    const where: Prisma.ClaimWhereInput = {};

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;
    if (status) {
      where.status = status as ClaimStatus;
    }

    const userFilter: Prisma.UserWhereInput = {};
    if ((user.role === "educator" || user.role === "super_educator") && user.educatorId) {
      userFilter.educatorId = user.educatorId;
    } else if (orgFilter.organizationId) {
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
        include: { user: true, deliveries: true, resolvedBy: { select: { id: true, fullName: true, email: true } } },
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
    if ((user.role === "educator" || user.role === "super_educator") && user.educatorId) {
      userFilter.educatorId = user.educatorId;
    } else if (orgFilter.organizationId) {
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
          },
        },
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
      TRANSMISOR_CONECTORES_OXIDADOS: "Conectores oxidados",
    };

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Reclamos");

    sheet.columns = [
      { header: "Nombre de paciente", key: "patientName", width: 30 },
      { header: "DNI", key: "dni", width: 16 },
      { header: "Insumo", key: "supply", width: 20 },
      { header: "Lote", key: "lotNumber", width: 18 },
      { header: "Serie", key: "serialNumber", width: 18 },
      { header: "Fecha de colocación", key: "colocationDate", width: 18 },
      { header: "Fecha de Falla", key: "failureDate", width: 18 },
      { header: "Días no utilizados", key: "daysClaimed", width: 20 },
      { header: "Motivo de Falla", key: "errorCode", width: 30 },
      { header: "Distribuidor", key: "distributor", width: 20 },
    ];

    sheet.getRow(1).font = { bold: true };

    for (const claim of claims) {
      let lotNumber = claim.lotNumber;
      let serialNumber: string | null = null;

      if ((!lotNumber || !serialNumber) && claim.supply) {
        const hw = claim.user.hardwareSupplies?.find(
          (h) => h.type === claim.supply,
        );
        if (hw) {
          if (!lotNumber) lotNumber = hw.lotNumber;
          if (!serialNumber) serialNumber = hw.serialNumber;
        }
      }

      sheet.addRow({
        patientName: claim.user.fullName ?? "-",
        dni: claim.user.dni ?? "-",
        supply: claim.supply ? (SUPPLY_LABELS[claim.supply] ?? claim.supply) : "-",
        lotNumber: lotNumber ?? "-",
        serialNumber: serialNumber ?? "-",
        colocationDate: formatDate(claim.colocationDate),
        failureDate: formatDate(claim.failureDate),
        daysClaimed: claim.daysClaimed ?? "-",
        errorCode: claim.errorCode ? (errorCodeLabels[claim.errorCode] ?? claim.errorCode) : "-",
        distributor: claim.user.organization?.name ?? "-",
      });
    }

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer as ArrayBuffer);
  }

  async findOne(claimId: string, user?: AuthUser) {
    const claim = await this.prisma.claim.findUnique({
      where: { id: claimId },
      include: { user: true, deliveries: true, resolvedBy: { select: { id: true, fullName: true, email: true } } },
    });
    if (claim && (user?.role === "educator" || user?.role === "super_educator") && user.educatorId) {
      if (claim.user.educatorId !== user.educatorId) {
        throw new ForbiddenException("No tiene acceso a este reclamo");
      }
    }
    return claim;
  }

  async findByUserId(userId: string, user?: AuthUser) {
    if ((user?.role === "educator" || user?.role === "super_educator") && user.educatorId) {
      const patient = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!patient || patient.educatorId !== user.educatorId) {
        throw new ForbiddenException("No tiene acceso a los reclamos de este usuario");
      }
    }
    return this.prisma.claim.findMany({
      where: { userId },
      include: { user: true, deliveries: true, resolvedBy: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async setStatus(
    id: string,
    status: ClaimStatus,
    qty: number,
    daysReimbursed?: number,
    resolutionMessage?: string,
    user?: AuthUser,
    returnedLots?: { lotNumber: string; qty: number }[]
  ) {
    const claim = await this.prisma.claim.findUnique({ where: { id } });
    if (!claim) throw new NotFoundException("Claim not found");

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
      status,
      resolvedAt: new Date(),
      ...(user && { resolvedBy: { connect: { id: user.userId } } }),
    };

    if (resolutionMessage !== undefined) {
      updateData.resolutionMessage = resolutionMessage;
    }

    if (returnedLots?.length) {
      updateData.returnedLots = returnedLots;
    }

    if (
      status === "approved" &&
      (claim.supply === SupplyType.SENSOR ||
        claim.supply === SupplyType.PARCHE_200U ||
        claim.supply === SupplyType.PARCHE_300U)
    ) {
      // Create delivery records for the reimbursement
      if (user) {
        if (returnedLots?.length) {
          // Create one delivery per lot, all linked to this claim
          for (const lot of returnedLots) {
            await this.prisma.delivery.create({
              data: {
                type: "claim_reimbursement",
                userId: claim.userId,
                organizationId: user.orgId ?? null,
                claimId: claim.id,
                quantity: lot.qty,
                daysReimbursed: daysReimbursed
                  ? Math.round((lot.qty / qty) * daysReimbursed)
                  : undefined,
                itemName: claim.supply ?? undefined,
                lotNumber: lot.lotNumber,
                date: new Date(),
                assignedById: user.userId,
                observations: resolutionMessage,
              },
            });
          }

          // Update balance days with the full daysReimbursed
          if (daysReimbursed && claim.supply) {
            await this.users.updateBalanceDays(
              claim.userId,
              daysReimbursed,
              claim.supply
            );
          }
        } else {
          // No lots specified — single delivery as before
          await this.deliveries.create(
            {
              userId: claim.userId,
              claimId: claim.id,
              quantity: qty,
              daysReimbursed,
              itemName: claim.supply ?? undefined,
              observations: resolutionMessage,
            },
            user.userId,
            user
          );
        }

        // Save the user's balance after the update
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

    await this.prisma.claim.update({
      where: { id },
      data: updateData,
    });

    return this.prisma.claim.findUnique({
      where: { id },
      include: { user: true, deliveries: true, resolvedBy: { select: { id: true, fullName: true, email: true } } },
    });
  }

  async addObservation(id: string, text: string, user: AuthUser) {
    const claim = await this.prisma.claim.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!claim) throw new NotFoundException("Claim not found");

    if ((user?.role === "educator" || user?.role === "super_educator") && user.educatorId) {
      if (claim.user.educatorId !== user.educatorId) {
        throw new ForbiddenException("No tiene acceso a este reclamo");
      }
    }

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
    };

    return this.prisma.claim.update({
      where: { id },
      data: { observations: [...currentObservations, newObservation] },
      include: { user: true, deliveries: true, resolvedBy: { select: { id: true, fullName: true, email: true } } },
    });
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

    if ((user.role === "educator" || user.role === "super_educator") && user.educatorId) {
      where.user = { educatorId: user.educatorId };
    } else if (orgFilter.organizationId) {
      where.user = { organizationId: orgFilter.organizationId };
    }

    console.log("Chart query where:", JSON.stringify(where, null, 2));
    console.log("User:", JSON.stringify(user));

    const claims = await this.prisma.claim.findMany({
      where,
      select: { supply: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    console.log("Claims found:", claims.length);

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
    if ((user.role === "educator" || user.role === "super_educator") && user.educatorId) {
      userWhere.educatorId = user.educatorId;
    } else if (orgFilter.organizationId) {
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
