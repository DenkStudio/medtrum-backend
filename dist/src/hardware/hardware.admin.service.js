"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardwareAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const organization_filter_helper_1 = require("../common/helpers/organization-filter.helper");
const paginate_query_1 = require("../utils/paginate-query");
let HardwareAdminService = class HardwareAdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, createdByUserId, organizationId) {
        const existing = await this.prisma.hardwareSupply.findFirst({
            where: {
                serialNumber: dto.serialNumber,
                type: dto.type,
            },
        });
        if (existing) {
            throw new common_1.ConflictException(`Hardware of type ${dto.type} with serial number ${dto.serialNumber} already exists`);
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
                type: client_1.HardwareActivityType.assignment,
                userId: createdByUserId,
                newUserId: dto.userId,
            },
        });
        return supply;
    }
    async deleteMany(ids) {
        return this.prisma.hardwareSupply.deleteMany({
            where: { id: { in: ids } },
        });
    }
    async findAll(query, user) {
        const { from, to, search } = query;
        const where = { ...(0, organization_filter_helper_1.buildOrgFilter)(user) };
        const dateFilter = (0, paginate_query_1.buildDateRangeFilter)(from, to);
        if (dateFilter)
            where.createdAt = dateFilter;
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
    async findByUserId(userId) {
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
    async findOne(id, user) {
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
        if (!supply)
            throw new common_1.NotFoundException("Hardware supply not found");
        if (user && !(0, organization_filter_helper_1.canAccessOrg)(user, supply.organizationId)) {
            throw new common_1.ForbiddenException("Cannot access hardware from different organization");
        }
        return supply;
    }
    async assign(hardwareId, userId, assignedByUserId, observations) {
        const hardware = await this.prisma.hardwareSupply.findUnique({
            where: { id: hardwareId },
        });
        if (!hardware)
            throw new common_1.NotFoundException("Hardware supply not found");
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
                    type: client_1.HardwareActivityType.assignment,
                    userId: assignedByUserId,
                    previousUserId,
                    newUserId: userId,
                    observations,
                },
            }),
        ]);
        return this.findOne(hardwareId);
    }
    async returnHardware(hardwareId, returnedByUserId, observations) {
        const hardware = await this.prisma.hardwareSupply.findUnique({
            where: { id: hardwareId },
        });
        if (!hardware)
            throw new common_1.NotFoundException("Hardware supply not found");
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
                    type: client_1.HardwareActivityType.return_hw,
                    userId: returnedByUserId,
                    previousUserId,
                    observations,
                },
            }),
        ]);
        return this.findOne(hardwareId);
    }
    async transfer(hardwareId, newUserId, transferredByUserId, observations) {
        const hardware = await this.prisma.hardwareSupply.findUnique({
            where: { id: hardwareId },
        });
        if (!hardware)
            throw new common_1.NotFoundException("Hardware supply not found");
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
                    type: client_1.HardwareActivityType.transfer,
                    userId: transferredByUserId,
                    previousUserId,
                    newUserId,
                    observations,
                },
            }),
        ]);
        return this.findOne(hardwareId);
    }
    async getErrorsByProduct(user) {
        var _a, _b;
        const orgFilter = (0, organization_filter_helper_1.buildOrgFilter)(user);
        const where = {
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
        const categoryLabelMap = {
            SENSOR: "Sensor",
            PARCHE_200U: "Parche 200u",
            PARCHE_300U: "Parche 300u",
            TRANSMISOR: "Transmisor",
            BASE_BOMBA_200U: "Bomba 200u",
            BASE_BOMBA_300U: "Bomba 300u",
            CABLE_TRANSMISOR: "Cable Transmisor",
            PDM: "PDM",
        };
        const errorLabelMap = {
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
        const grouped = new Map();
        for (const row of claims) {
            const code = row.errorCode;
            const cat = row.supply || "OTROS";
            if (!grouped.has(cat))
                grouped.set(cat, []);
            const existing = grouped.get(cat).find((e) => e.errorCode === code);
            const count = (_b = (_a = row._count) === null || _a === void 0 ? void 0 : _a._all) !== null && _b !== void 0 ? _b : 0;
            if (existing) {
                existing.count += count;
            }
            else {
                grouped.get(cat).push({
                    errorCode: code,
                    count,
                });
            }
        }
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
            const errors = grouped.get(cat);
            const labels = errors.map((e) => errorLabelMap[e.errorCode] || e.errorCode);
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
                        backgroundColor: labels.map((_, i) => palette[i % palette.length]),
                        hoverBackgroundColor: labels.map((_, i) => hoverPalette[i % hoverPalette.length]),
                        borderWidth: 0,
                    },
                ],
            };
        });
    }
    async getChartByType(user) {
        const orgFilter = (0, organization_filter_helper_1.buildOrgFilter)(user);
        const where = { ...orgFilter };
        const hardware = await this.prisma.hardwareSupply.groupBy({
            by: ["type"],
            where,
            _count: { id: true },
            orderBy: { type: "asc" },
        });
        const labelMap = {
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
                    hoverBackgroundColor: labels.map((_, i) => hoverPalette[i % hoverPalette.length]),
                    borderWidth: 0,
                },
            ],
        };
    }
};
exports.HardwareAdminService = HardwareAdminService;
exports.HardwareAdminService = HardwareAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HardwareAdminService);
//# sourceMappingURL=hardware.admin.service.js.map