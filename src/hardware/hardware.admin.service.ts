import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateHardwareSupplyDto } from "./dto/create-hardware-supply.dto";
import { UpdateHardwareSupplyDto } from "./dto/update-hardware-supply.dto";
import { UpdateHardwareLogisticaDto } from "./dto/update-hardware-logistica.dto";
import { HardwareStatus, SupplyType } from "@prisma/client";
import {
  AuthUser,
  buildOrgFilter,
  canAccessOrg,
} from "../common/helpers/organization-filter.helper";
import { Prisma } from "@prisma/client";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { buildDateRangeFilter } from "src/utils/paginate-query";
import { parseDate } from "../common/helpers/date.helper";

const SUPPLY_TYPE_LABELS: Record<string, string> = {
  SENSOR: "Sensor",
  PARCHE_200U: "Parche 200U",
  PARCHE_300U: "Parche 300U",
  TRANSMISOR: "Transmisor",
  BASE_BOMBA_200U: "Base Bomba 200U",
  BASE_BOMBA_300U: "Base Bomba 300U",
  CABLE_TRANSMISOR: "Cable Transmisor",
  PDM: "PDM",
};

function supplyLabel(type: string): string {
  return SUPPLY_TYPE_LABELS[type] || type;
}

@Injectable()
export class HardwareAdminService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateHardwareSupplyDto,
    createdByUserId: string,
    organizationId?: string,
  ) {
    if (dto.serialNumber) {
      const existing = await this.prisma.hardwareSupply.findFirst({
        where: {
          serialNumber: dto.serialNumber,
          type: dto.type,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Ya existe un producto de tipo ${supplyLabel(dto.type)} con número de serie ${dto.serialNumber}`,
        );
      }
    }

    // Mark existing active hardware of the same type for this user as replaced
    if (dto.userId) {
      await this.prisma.hardwareSupply.updateMany({
        where: {
          userId: dto.userId,
          type: dto.type,
          status: HardwareStatus.active,
        },
        data: { status: HardwareStatus.replaced },
      });
    }

    const supply = await this.prisma.hardwareSupply.create({
      data: {
        type: dto.type,
        serialNumber: dto.serialNumber,
        lotNumber: dto.lotNumber,
        userId: dto.userId,
        organizationId,
        assignedDate: new Date(),
        saleDate: dto.saleDate ? parseDate(dto.saleDate) : undefined,
        placementDate: dto.placementDate ? parseDate(dto.placementDate) : undefined,
      },
    });

    // Auto-create companion CABLE_TRANSMISOR when creating a TRANSMISOR
    if (dto.type === SupplyType.TRANSMISOR) {
      let cableExists = false;
      if (dto.serialNumber) {
        const found = await this.prisma.hardwareSupply.findFirst({
          where: {
            serialNumber: dto.serialNumber,
            type: SupplyType.CABLE_TRANSMISOR,
          },
        });
        cableExists = !!found;
      }

      if (!cableExists) {
        // Mark existing active CABLE_TRANSMISOR for this user as replaced
        if (dto.userId) {
          await this.prisma.hardwareSupply.updateMany({
            where: {
              userId: dto.userId,
              type: SupplyType.CABLE_TRANSMISOR,
              status: HardwareStatus.active,
            },
            data: { status: HardwareStatus.replaced },
          });
        }

        const cable = await this.prisma.hardwareSupply.create({
          data: {
            type: SupplyType.CABLE_TRANSMISOR,
            serialNumber: dto.serialNumber,
            lotNumber: dto.lotNumber,
            userId: dto.userId,
            organizationId,
            assignedDate: new Date(),
            saleDate: dto.saleDate ? parseDate(dto.saleDate) : undefined,
            placementDate: dto.placementDate ? parseDate(dto.placementDate) : undefined,
            linkedHardwareId: supply.id,
          },
        });

      }
    }

    // Auto-create companion PDM when creating a BASE_BOMBA
    if (
      dto.type === SupplyType.BASE_BOMBA_200U ||
      dto.type === SupplyType.BASE_BOMBA_300U
    ) {
      if (dto.pdmSerialNumber) {
        const pdmExists = await this.prisma.hardwareSupply.findFirst({
          where: {
            serialNumber: dto.pdmSerialNumber,
            type: SupplyType.PDM,
          },
        });

        if (pdmExists) {
          throw new ConflictException(
            `Ya existe un PDM con número de serie ${dto.pdmSerialNumber}`,
          );
        }
      }

      // Mark existing active PDM for this user as replaced
      if (dto.userId) {
        await this.prisma.hardwareSupply.updateMany({
          where: {
            userId: dto.userId,
            type: SupplyType.PDM,
            status: HardwareStatus.active,
          },
          data: { status: HardwareStatus.replaced },
        });
      }

      const pdm = await this.prisma.hardwareSupply.create({
        data: {
          type: SupplyType.PDM,
          serialNumber: dto.pdmSerialNumber || null,
          lotNumber: dto.lotNumber,
          userId: dto.userId,
          organizationId,
          assignedDate: new Date(),
          saleDate: dto.saleDate ? parseDate(dto.saleDate) : undefined,
          placementDate: dto.placementDate ? parseDate(dto.placementDate) : undefined,
          linkedHardwareId: supply.id,
        },
      });

    }

    return supply;
  }

  async deleteMany(ids: string[]) {
    return this.prisma.hardwareSupply.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async update(id: string, dto: UpdateHardwareSupplyDto, user: AuthUser) {
    const hardware = await this.prisma.hardwareSupply.findUnique({
      where: { id },
    });

    if (!hardware) throw new NotFoundException("Hardware supply not found");

    if (!canAccessOrg(user, hardware.organizationId)) {
      throw new ForbiddenException(
        "Cannot access hardware from different organization",
      );
    }

    // Educators can only update placementDate
    if (user.role === "educator" || user.role === "super_educator") {
      const allowedFields = ["placementDate"];
      const attemptedFields = Object.keys(dto).filter(
        (k) => (dto as Record<string, any>)[k] !== undefined,
      );
      const disallowed = attemptedFields.filter(
        (f) => !allowedFields.includes(f),
      );
      if (disallowed.length > 0) {
        throw new ForbiddenException(
          "Los educadores solo pueden editar la fecha de aplicación",
        );
      }
    }

    if (dto.serialNumber || dto.type) {
      const checkType = dto.type || hardware.type;
      const checkSerial = dto.serialNumber || hardware.serialNumber;

      const duplicate = await this.prisma.hardwareSupply.findFirst({
        where: {
          serialNumber: checkSerial,
          type: checkType,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          `Ya existe un producto de tipo ${supplyLabel(checkType)} con número de serie ${checkSerial}`,
        );
      }
    }

    return this.prisma.hardwareSupply.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.serialNumber !== undefined && { serialNumber: dto.serialNumber }),
        ...(dto.lotNumber !== undefined && { lotNumber: dto.lotNumber }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.userId !== undefined && { userId: dto.userId }),
        ...(dto.organizationId !== undefined && { organizationId: dto.organizationId }),
        ...(dto.placementDate !== undefined && { placementDate: parseDate(dto.placementDate) }),
        ...(dto.saleDate !== undefined && { saleDate: parseDate(dto.saleDate) }),
      },
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
      },
    });
  }

  async findAll(query: QueryOptionsDto, user: AuthUser) {
    const { page = 1, limit = 20, from, to, search } = query;
    const where: Prisma.HardwareSupplyWhereInput = { ...buildOrgFilter(user) };

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;

    if (search) {
      where.user = {
        fullName: { contains: search, mode: "insensitive" },
      };
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.hardwareSupply.count({ where }),
      this.prisma.hardwareSupply.findMany({
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
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUserId(userId: string, user: AuthUser) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!targetUser) throw new NotFoundException("User not found");

    if (!canAccessOrg(user, targetUser.organizationId)) {
      throw new ForbiddenException("Cannot access hardware from different organization");
    }

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

  async getErrorsByProduct(user: AuthUser, organizationId?: string) {
    const orgFilter = buildOrgFilter(user);
    const effectiveOrgId = orgFilter.organizationId || organizationId;

    const where: Prisma.ClaimWhereInput = {
      errorCode: { not: null },
    };

    if (effectiveOrgId) {
      where.user = { organizationId: effectiveOrgId };
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

  async getChartByType(user: AuthUser, organizationId?: string) {
    const orgFilter = buildOrgFilter(user);
    const effectiveOrgId = orgFilter.organizationId || organizationId;
    const where: Prisma.HardwareSupplyWhereInput = {
      ...(effectiveOrgId ? { organizationId: effectiveOrgId } : {}),
    };

    const hardware = await this.prisma.hardwareSupply.groupBy({
      by: ["type"],
      where,
      _count: { id: true },
      orderBy: { type: "asc" },
    });

    const labelMap: Record<string, string> = {
      BASE_BOMBA_200U: "Base Bomba 200U",
      BASE_BOMBA_300U: "Base Bomba 300U",
      PDM: "PDM",
      TRANSMISOR: "Transmisor",
      CABLE_TRANSMISOR: "Cable Transmisor",
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

  async findIncomplete(query: QueryOptionsDto, user: AuthUser) {
    const { page = 1, limit = 20, search, from, to } = query;
    const skip = (page - 1) * limit;

    // Filter by org: check both hardware's org and the patient's org
    const orgFilter = buildOrgFilter(user);

    const where: Prisma.HardwareSupplyWhereInput = {
      // Exclude linked items (they show nested under their parent)
      linkedHardwareId: null,
      AND: [
        // Org filter: match hardware org OR patient org
        orgFilter.organizationId
          ? {
              OR: [
                { organizationId: orgFilter.organizationId },
                { user: { organizationId: orgFilter.organizationId } },
              ],
            }
          : {},
        // Incomplete filter: at least one field missing
        {
          OR: [
            { serialNumber: null },
            { lotNumber: null },
            { saleDate: null },
            {
              linkedFrom: {
                some: {
                  OR: [
                    { serialNumber: null },
                    { lotNumber: null },
                    { saleDate: null },
                  ],
                },
              },
            },
          ],
        },
      ],
    };

    const dateFilter = buildDateRangeFilter(from, to);
    if (dateFilter) where.createdAt = dateFilter;

    if (search) {
      where.user = {
        fullName: { contains: search, mode: "insensitive" },
      };
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.hardwareSupply.count({ where }),
      this.prisma.hardwareSupply.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              dni: true,
              educator: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          linkedFrom: {
            select: {
              id: true,
              type: true,
              serialNumber: true,
              lotNumber: true,
              saleDate: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
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

  async updateLogisticaFields(
    id: string,
    dto: UpdateHardwareLogisticaDto,
    user: AuthUser,
  ) {
    const hardware = await this.prisma.hardwareSupply.findUnique({
      where: { id },
      include: { linkedFrom: { select: { id: true, type: true } } },
    });

    if (!hardware) throw new NotFoundException("Hardware supply not found");

    if (!canAccessOrg(user, hardware.organizationId)) {
      throw new ForbiddenException(
        "Cannot access hardware from different organization",
      );
    }

    if (dto.serialNumber) {
      const duplicate = await this.prisma.hardwareSupply.findFirst({
        where: {
          serialNumber: dto.serialNumber,
          type: hardware.type,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          `Ya existe un producto de tipo ${supplyLabel(hardware.type)} con número de serie ${dto.serialNumber}`,
        );
      }
    }

    // Validate linked item serial number (e.g. PDM serial)
    if (dto.linkedSerialNumber && (hardware as any).linkedFrom?.length > 0) {
      const linked = (hardware as any).linkedFrom[0];
      const duplicate = await this.prisma.hardwareSupply.findFirst({
        where: {
          serialNumber: dto.linkedSerialNumber,
          type: linked.type,
          id: { not: linked.id },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          `Ya existe un producto de tipo ${supplyLabel(linked.type)} con número de serie ${dto.linkedSerialNumber}`,
        );
      }
    }

    // Update the main hardware
    const updated = await this.prisma.hardwareSupply.update({
      where: { id },
      data: {
        ...(dto.serialNumber !== undefined && { serialNumber: dto.serialNumber }),
        ...(dto.lotNumber !== undefined && { lotNumber: dto.lotNumber }),
        ...(dto.saleDate !== undefined && { saleDate: parseDate(dto.saleDate) }),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        linkedFrom: {
          select: {
            id: true,
            type: true,
            serialNumber: true,
            lotNumber: true,
            saleDate: true,
          },
        },
      },
    });

    // Update linked items (e.g. PDM, cable) — shared lot number and sale date
    if ((hardware as any).linkedFrom?.length > 0) {
      const isTransmisorCableKit =
        (hardware.type === SupplyType.TRANSMISOR || hardware.type === SupplyType.CABLE_TRANSMISOR);

      for (const linked of (hardware as any).linkedFrom) {
        // For Transmisor+Cable kits, share the same serial number
        const linkedSerial = dto.linkedSerialNumber !== undefined
          ? dto.linkedSerialNumber
          : (isTransmisorCableKit && dto.serialNumber !== undefined)
            ? dto.serialNumber
            : undefined;

        await this.prisma.hardwareSupply.update({
          where: { id: linked.id },
          data: {
            ...(dto.lotNumber !== undefined && { lotNumber: dto.lotNumber }),
            ...(dto.saleDate !== undefined && { saleDate: parseDate(dto.saleDate) }),
            ...(linkedSerial !== undefined && { serialNumber: linkedSerial }),
          },
        });
      }
    }

    return updated;
  }
}
