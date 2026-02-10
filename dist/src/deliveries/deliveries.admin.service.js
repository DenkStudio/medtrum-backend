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
exports.DeliveriesAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const users_service_1 = require("../users/users.service");
const paginate_query_1 = require("../utils/paginate-query");
const organization_filter_helper_1 = require("../common/helpers/organization-filter.helper");
const date_helper_1 = require("../common/helpers/date.helper");
let DeliveriesAdminService = class DeliveriesAdminService {
    constructor(prisma, users) {
        this.prisma = prisma;
        this.users = users;
    }
    async create(dto, assignedByUserId, user) {
        var _a;
        const organizationId = (0, organization_filter_helper_1.getCreateOrgId)(user, dto.organizationId);
        const deliveryDate = dto.date ? (0, date_helper_1.parseDate)(dto.date) : new Date();
        const type = dto.claimId
            ? client_1.DeliveryType.claim_reimbursement
            : client_1.DeliveryType.supply_delivery;
        const patient = await this.prisma.user.findUnique({
            where: { id: dto.userId },
        });
        if (!patient)
            throw new common_1.NotFoundException("User not found");
        const delivery = await this.prisma.delivery.create({
            data: {
                type,
                userId: dto.userId,
                organizationId,
                claimId: dto.claimId,
                quantity: (_a = dto.quantity) !== null && _a !== void 0 ? _a : 0,
                daysReimbursed: dto.daysReimbursed,
                itemName: dto.itemName,
                date: deliveryDate,
                assignedById: assignedByUserId,
                observations: dto.observations,
            },
        });
        if (dto.daysReimbursed && dto.itemName) {
            const supply = dto.itemName;
            if (supply === client_1.SupplyType.SENSOR ||
                supply === client_1.SupplyType.PARCHE_200U ||
                supply === client_1.SupplyType.PARCHE_300U) {
                await this.users.updateBalanceDays(dto.userId, dto.daysReimbursed, supply);
            }
        }
        return delivery;
    }
    async findAll(query, user) {
        const { page, limit, sort, type, search, from, to } = query;
        const orgFilter = (0, organization_filter_helper_1.buildOrgFilter)(user);
        const where = {};
        const dateFilter = (0, paginate_query_1.buildDateRangeFilter)(from, to);
        if (dateFilter)
            where.createdAt = dateFilter;
        const userFilter = {};
        if (orgFilter.organizationId) {
            where.organizationId = orgFilter.organizationId;
        }
        if (type) {
            where.type = type;
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
                orderBy: (0, paginate_query_1.buildOrderBy)(sort) || { createdAt: "desc" },
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
    async findOne(id) {
        const delivery = await this.prisma.delivery.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, fullName: true, email: true } },
                claim: true,
                assignedBy: { select: { id: true, fullName: true, email: true } },
            },
        });
        if (!delivery)
            throw new common_1.NotFoundException("Delivery not found");
        return delivery;
    }
    async findByUserId(userId, user) {
        const orgFilter = (0, organization_filter_helper_1.buildOrgFilter)(user);
        const where = { userId };
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
};
exports.DeliveriesAdminService = DeliveriesAdminService;
exports.DeliveriesAdminService = DeliveriesAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService])
], DeliveriesAdminService);
//# sourceMappingURL=deliveries.admin.service.js.map