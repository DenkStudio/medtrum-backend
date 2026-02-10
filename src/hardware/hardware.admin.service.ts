import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateHardwareSupplyDto } from "./dto/create-hardware-supply.dto";
import { HardwareActivityType } from "@prisma/client";
import {
  AuthUser,
  buildOrgFilter,
  canAccessOrg,
} from "../common/helpers/organization-filter.helper";
import { Prisma } from "@prisma/client";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { buildDateRangeFilter } from "src/utils/paginate-query";

@Injectable()
export class HardwareAdminService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateHardwareSupplyDto,
    createdByUserId: string,
    organizationId?: string,
  ) {
    const existing = await this.prisma.hardwareSupply.findFirst({
      where: {
        serialNumber: dto.serialNumber,
        type: dto.type,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Hardware of type ${dto.type} with serial number ${dto.serialNumber} already exists`,
      );
    }

    const supply = await this.prisma.hardwareSupply.create({
      data: {
        type: dto.type,
        serialNumber: dto.serialNumber,
        userId: dto.userId,
        organizationId,
        assignedDate: new Date(),
      },
    });

    await this.prisma.hardwareActivityLog.create({
      data: {
        hardwareId: supply.id,
        type: HardwareActivityType.assignment,
        userId: createdByUserId,
        newUserId: dto.userId,
      },
    });

    return supply;
  }

  async deleteMany(ids: string[]) {
    return this.prisma.hardwareSupply.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async findAll(query: QueryOptionsDto, user: AuthUser) {
    const { from, to, search } = query;
    const where: Prisma.HardwareSupplyWhereInput = { ...buildOrgFilter(user) };

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;

    if (search) {
      where.user = {
        fullName: { contains: search, mode: "insensitive" },
      };
    }

    return this.prisma.hardwareSupply.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            doctor: true,
            healthcare: true,
          },
        },
        activityLogs: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            previousUser: { select: { id: true, fullName: true, email: true } },
            newUser: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.hardwareSupply.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            doctor: true,
            healthcare: true,
          },
        },
        activityLogs: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            previousUser: { select: { id: true, fullName: true, email: true } },
            newUser: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });
  }

  async findOne(id: string, user?: AuthUser) {
    const supply = await this.prisma.hardwareSupply.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            doctor: true,
            healthcare: true,
          },
        },
        activityLogs: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            previousUser: { select: { id: true, fullName: true, email: true } },
            newUser: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    if (!supply) throw new NotFoundException("Hardware supply not found");

    if (user && !canAccessOrg(user, supply.organizationId)) {
      throw new ForbiddenException(
        "Cannot access hardware from different organization",
      );
    }

    return supply;
  }

  async assign(
    hardwareId: string,
    userId: string,
    assignedByUserId: string,
    observations?: string,
  ) {
    const hardware = await this.prisma.hardwareSupply.findUnique({
      where: { id: hardwareId },
    });

    if (!hardware) throw new NotFoundException("Hardware supply not found");

    const previousUserId = hardware.userId;

    await this.prisma.$transaction([
      this.prisma.hardwareSupply.update({
        where: { id: hardwareId },
        data: {
          userId,
          assignedDate: new Date(),
        },
      }),
      this.prisma.hardwareActivityLog.create({
        data: {
          hardwareId,
          type: HardwareActivityType.assignment,
          userId: assignedByUserId,
          previousUserId,
          newUserId: userId,
          observations,
        },
      }),
    ]);

    return this.findOne(hardwareId);
  }

  async returnHardware(
    hardwareId: string,
    returnedByUserId: string,
    observations?: string,
  ) {
    const hardware = await this.prisma.hardwareSupply.findUnique({
      where: { id: hardwareId },
    });

    if (!hardware) throw new NotFoundException("Hardware supply not found");
    if (!hardware.userId)
      throw new Error("Hardware is not assigned to any user");

    const previousUserId = hardware.userId;

    await this.prisma.$transaction([
      this.prisma.hardwareSupply.update({
        where: { id: hardwareId },
        data: {
          userId: null,
          assignedDate: null,
        },
      }),
      this.prisma.hardwareActivityLog.create({
        data: {
          hardwareId,
          type: HardwareActivityType.return_hw,
          userId: returnedByUserId,
          previousUserId,
          observations,
        },
      }),
    ]);

    return this.findOne(hardwareId);
  }

  async transfer(
    hardwareId: string,
    newUserId: string,
    transferredByUserId: string,
    observations?: string,
  ) {
    const hardware = await this.prisma.hardwareSupply.findUnique({
      where: { id: hardwareId },
    });

    if (!hardware) throw new NotFoundException("Hardware supply not found");
    if (!hardware.userId)
      throw new Error("Hardware is not assigned to any user");

    const previousUserId = hardware.userId;

    await this.prisma.$transaction([
      this.prisma.hardwareSupply.update({
        where: { id: hardwareId },
        data: {
          userId: newUserId,
          assignedDate: new Date(),
        },
      }),
      this.prisma.hardwareActivityLog.create({
        data: {
          hardwareId,
          type: HardwareActivityType.transfer,
          userId: transferredByUserId,
          previousUserId,
          newUserId,
          observations,
        },
      }),
    ]);

    return this.findOne(hardwareId);
  }

  async getErrorsByProduct(user: AuthUser) {
    const orgFilter = buildOrgFilter(user);

    const where: Prisma.ClaimWhereInput = {
      errorCode: { not: null },
    };

    if (orgFilter.organizationId) {
      where.user = { organizationId: orgFilter.organizationId };
    }

    const claims = await this.prisma.claim.groupBy({
      by: ["errorCode", "supply"],
      where,
      _count: { _all: true },
    });

    const categoryLabelMap: Record<string, string> = {
      SENSOR: "Sensor",
      PARCHE_200U: "Parche 200u",
      PARCHE_300U: "Parche 300u",
      TRANSMISOR: "Transmisor",
      BASE_BOMBA_200U: "Bomba 200u",
      BASE_BOMBA_300U: "Bomba 300u",
      CABLE_TRANSMISOR: "Cable Transmisor",
      PDM: "PDM",
    };

    const errorLabelMap: Record<string, string> = {
      SENSOR_FALLA: "Falla",
      SENSOR_FALTA_ADHESIVO: "Falta adhesivo",
      SENSOR_DIFERENCIA_CAPILAR: "Diferencia capilar",
      SENSOR_PERDIDO: "Perdido",
      SENSOR_DESCONOCIDO: "???",
      SENSOR_SANGRADO_COLOCACION: "Sangrado colocación",
      SENSOR_OTROS: "Otros",
      PARCHE_FALTA_ADHESIVO: "Falta adhesivo",
      PARCHE_ERROR: "Error",
      PARCHE_OBSTRUCCION: "Obstrucción",
      PARCHE_BATERIA_AGOTADA: "Batería agotada",
      PARCHE_ERROR_CEBADO: "Error cebado",
      PARCHE_DESACTIVADO: "Desactivado",
      PARCHE_OTROS: "Otros",
      TRANSMISOR_CONECTORES_OXIDADOS: "Conectores oxidados",
      TRANSMISOR_LUZ_VERDE_NO_PARPADEA: "Luz verde no parpadea",
      TRANSMISOR_PROBLEMAS_BATERIA: "Problemas batería",
      TRANSMISOR_ROTURA: "Rotura",
      TRANSMISOR_OTROS: "Otros",
      BASE_BOMBA_CONECTORES_OXIDADOS: "Conectores oxidados",
      BASE_BOMBA_NO_ENCASTRA: "No encastra",
      BASE_BOMBA_NO_HACE_PITIDOS: "No hace pitidos",
      BASE_BOMBA_ROTURA: "Rotura",
      BASE_BOMBA_OTROS: "Otros",
      CABLE_NO_CARGA: "No carga",
      CABLE_PIN_DOBLADO: "Pin doblado",
      CABLE_OTROS: "Otros",
      PDM_NO_CARGA_NO_ENCIENDE: "No carga / no enciende",
      PDM_SE_APAGA_SOLO: "Se apaga solo",
      PDM_NO_CARGA: "No carga",
      PDM_ROTURA: "Rotura",
      PDM_OTROS: "Otros",
    };

    const palette = [
      "#3B82F6",
      "#8B5CF6",
      "#F59E0B",
      "#22C55E",
      "#F43F5E",
      "#6366F1",
      "#14B8A6",
    ];
    const hoverPalette = [
      "#2563EB",
      "#7C3AED",
      "#D97706",
      "#16A34A",
      "#E11D48",
      "#4F46E5",
      "#0D9488",
    ];

    // Group errors by supply type (supply is the source of truth for the category)
    const grouped = new Map<string, { errorCode: string; count: number }[]>();
    for (const row of claims) {
      const code = (row as any).errorCode as string;
      const cat = ((row as any).supply as string) || "OTROS";

      if (!grouped.has(cat)) grouped.set(cat, []);
      const existing = grouped.get(cat)!.find((e) => e.errorCode === code);
      const count = (row._count as any)?._all ?? 0;
      if (existing) {
        existing.count += count;
      } else {
        grouped.get(cat)!.push({
          errorCode: code,
          count,
        });
      }
    }

    // Build chart-ready response per product
    const orderedKeys = [
      "SENSOR",
      "PARCHE_200U",
      "PARCHE_300U",
      "TRANSMISOR",
      "BASE_BOMBA_200U",
      "BASE_BOMBA_300U",
      "CABLE_TRANSMISOR",
      "PDM",
    ];
    return orderedKeys
      .filter((cat) => grouped.has(cat))
      .map((cat) => {
        const errors = grouped.get(cat)!;
        const labels = errors.map(
          (e) => errorLabelMap[e.errorCode] || e.errorCode,
        );
        const data = errors.map((e) => e.count);
        const total = data.reduce((sum, v) => sum + v, 0);

        return {
          product: cat,
          productLabel: categoryLabelMap[cat] || cat,
          total,
          labels,
          datasets: [
            {
              label: categoryLabelMap[cat] || cat,
              data,
              backgroundColor: labels.map(
                (_, i) => palette[i % palette.length],
              ),
              hoverBackgroundColor: labels.map(
                (_, i) => hoverPalette[i % hoverPalette.length],
              ),
              borderWidth: 0,
            },
          ],
        };
      });
  }

  async getChartByType(user: AuthUser) {
    const orgFilter = buildOrgFilter(user);
    const where: Prisma.HardwareSupplyWhereInput = { ...orgFilter };

    const hardware = await this.prisma.hardwareSupply.groupBy({
      by: ["type"],
      where,
      _count: { id: true },
      orderBy: { type: "asc" },
    });

    const labelMap: Record<string, string> = {
      Bomba_200u: "Bomba 200u",
      Bomba_300u: "Bomba 300u",
      PDM: "PDM",
      Transmisor: "Transmisor",
      Cable_transmisor: "Cable transmisor",
    };

    const palette = ["#3B82F6", "#8B5CF6", "#F59E0B", "#22C55E", "#F43F5E"];
    const hoverPalette = [
      "#2563EB",
      "#7C3AED",
      "#D97706",
      "#16A34A",
      "#E11D48",
    ];

    const labels = hardware.map((h) => labelMap[h.type] || h.type);
    const data = hardware.map((h) => h._count.id);

    return {
      labels,
      datasets: [
        {
          label: "Hardware",
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
