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
exports.ClaimsAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
const paginate_query_1 = require("../utils/paginate-query");
const client_1 = require("@prisma/client");
const organization_filter_helper_1 = require("../common/helpers/organization-filter.helper");
const deliveries_admin_service_1 = require("../deliveries/deliveries.admin.service");
const date_helper_1 = require("../common/helpers/date.helper");
let ClaimsAdminService = class ClaimsAdminService {
    constructor(prisma, users, deliveries) {
        this.prisma = prisma;
        this.users = users;
        this.deliveries = deliveries;
    }
    async findAll(query, user) {
        const { page, limit, sort, status, search, from, to } = query;
        const orgFilter = (0, organization_filter_helper_1.buildOrgFilter)(user);
        const where = {};
        const dateFilter = (0, paginate_query_1.buildDateRangeFilter)(from, to);
        if (dateFilter)
            where.createdAt = dateFilter;
        if (status) {
            where.status = status;
        }
        const userFilter = {};
        if (user.role === "educator" && user.educatorId) {
            userFilter.educatorId = user.educatorId;
        }
        else if (orgFilter.organizationId) {
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
                orderBy: (0, paginate_query_1.buildOrderBy)(sort),
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
    async findOne(claimId, user) {
        const claim = await this.prisma.claim.findUnique({
            where: { id: claimId },
            include: { user: true, deliveries: true, resolvedBy: { select: { id: true, fullName: true, email: true } } },
        });
        if (claim && (user === null || user === void 0 ? void 0 : user.role) === "educator" && user.educatorId) {
            if (claim.user.educatorId !== user.educatorId) {
                throw new common_1.ForbiddenException("No tiene acceso a este reclamo");
            }
        }
        return claim;
    }
    async findByUserId(userId, user) {
        if ((user === null || user === void 0 ? void 0 : user.role) === "educator" && user.educatorId) {
            const patient = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!patient || patient.educatorId !== user.educatorId) {
                throw new common_1.ForbiddenException("No tiene acceso a los reclamos de este usuario");
            }
        }
        return this.prisma.claim.findMany({
            where: { userId },
            include: { user: true, deliveries: true, resolvedBy: { select: { id: true, fullName: true, email: true } } },
            orderBy: { createdAt: "desc" },
        });
    }
    async setStatus(id, status, qty, daysReimbursed, resolutionMessage, user) {
        var _a, _b, _c, _d;
        const claim = await this.prisma.claim.findUnique({ where: { id } });
        if (!claim)
            throw new common_1.NotFoundException("Claim not found");
        const updateData = {
            status,
            resolvedAt: new Date(),
            ...(user && { resolvedBy: { connect: { id: user.userId } } }),
        };
        if (resolutionMessage !== undefined) {
            updateData.resolutionMessage = resolutionMessage;
        }
        if (status === "approved" &&
            (claim.supply === client_1.SupplyType.SENSOR ||
                claim.supply === client_1.SupplyType.PARCHE_200U ||
                claim.supply === client_1.SupplyType.PARCHE_300U)) {
            if (user) {
                await this.deliveries.create({
                    userId: claim.userId,
                    claimId: claim.id,
                    quantity: qty,
                    daysReimbursed,
                    itemName: (_a = claim.supply) !== null && _a !== void 0 ? _a : undefined,
                    observations: resolutionMessage,
                }, user.userId, user);
                const updatedPatient = await this.prisma.user.findUnique({
                    where: { id: claim.userId },
                });
                if (updatedPatient) {
                    updateData.balanceAfterResolution = claim.supply === client_1.SupplyType.SENSOR
                        ? (_b = updatedPatient.balanceDaysSensor) !== null && _b !== void 0 ? _b : 0
                        : (_c = updatedPatient.balanceDaysParche) !== null && _c !== void 0 ? _c : 0;
                }
            }
        }
        if (status === "rejected" &&
            (claim.supply === client_1.SupplyType.SENSOR ||
                claim.supply === client_1.SupplyType.PARCHE_200U ||
                claim.supply === client_1.SupplyType.PARCHE_300U)) {
            await this.users.updateBalanceDays(claim.userId, -((_d = claim.daysClaimed) !== null && _d !== void 0 ? _d : 0), claim.supply);
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
    buildDateRange(startDate, endDate) {
        const start = (0, date_helper_1.parseDate)(startDate);
        start.setUTCHours(0, 0, 0, 0);
        const end = (0, date_helper_1.parseDate)(endDate);
        end.setUTCHours(23, 59, 59, 999);
        return { gte: start, lte: end };
    }
    async getChartData(query, user) {
        const { startDate, endDate } = query;
        const orgFilter = (0, organization_filter_helper_1.buildOrgFilter)(user);
        const where = {
            createdAt: this.buildDateRange(startDate, endDate),
        };
        if (user.role === "educator" && user.educatorId) {
            where.user = { educatorId: user.educatorId };
        }
        else if (orgFilter.organizationId) {
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
        const suppliesSet = new Set();
        const monthlyMap = new Map();
        for (const claim of claims) {
            const supply = claim.supply || "Sin producto";
            suppliesSet.add(supply);
            const date = new Date(claim.createdAt);
            const monthKey = `${String(date.getMonth() + 1).padStart(2, "0")}-01-${date.getFullYear()}`;
            if (!monthlyMap.has(monthKey)) {
                monthlyMap.set(monthKey, new Map());
            }
            const monthBucket = monthlyMap.get(monthKey);
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
                label: supply,
                data: labels.map((label) => { var _a; return ((_a = monthlyMap.get(label)) === null || _a === void 0 ? void 0 : _a.get(supply)) || 0; }),
                backgroundColor: color.bg,
                hoverBackgroundColor: color.hover,
                barPercentage: 0.7,
                categoryPercentage: 0.7,
                borderRadius: 4,
            };
        });
        return { labels, datasets };
    }
    async getClaimsByUserChart(query, user) {
        const { startDate, endDate } = query;
        const orgFilter = (0, organization_filter_helper_1.buildOrgFilter)(user);
        const userWhere = { role: "patient" };
        if (user.role === "educator" && user.educatorId) {
            userWhere.educatorId = user.educatorId;
        }
        else if (orgFilter.organizationId) {
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
        const countMap = new Map();
        for (const patient of patients) {
            const claimCount = patient.claims.length;
            countMap.set(claimCount, (countMap.get(claimCount) || 0) + 1);
        }
        const sortedEntries = Array.from(countMap.entries()).sort((a, b) => a[0] - b[0]);
        const labels = sortedEntries.map(([count]) => count === 1 ? "1 reclamo" : `${count} reclamos`);
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
                    hoverBackgroundColor: labels.map((_, i) => hoverPalette[i % hoverPalette.length]),
                    borderWidth: 0,
                },
            ],
        };
    }
};
exports.ClaimsAdminService = ClaimsAdminService;
exports.ClaimsAdminService = ClaimsAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService,
        deliveries_admin_service_1.DeliveriesAdminService])
], ClaimsAdminService);
//# sourceMappingURL=claims.admin.service.js.map