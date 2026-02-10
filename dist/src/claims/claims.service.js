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
exports.ClaimsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
const paginate_query_1 = require("../utils/paginate-query");
const client_1 = require("@prisma/client");
const claim_error_codes_1 = require("./constants/claim-error-codes");
const date_helper_1 = require("../common/helpers/date.helper");
let ClaimsService = class ClaimsService {
    constructor(prisma, users) {
        this.prisma = prisma;
        this.users = users;
    }
    async create(dto, userId) {
        var _a, _b;
        if (!userId) {
            throw new common_1.BadRequestException("userId is required");
        }
        if (dto.errorCode && dto.claimCategory) {
            const validCodes = claim_error_codes_1.CLAIM_ERROR_CODES_BY_CATEGORY[dto.claimCategory];
            if (!validCodes.includes(dto.errorCode)) {
                throw new common_1.BadRequestException(`Error code "${dto.errorCode}" is not valid for category "${dto.claimCategory}"`);
            }
        }
        const claim = await this.prisma.claim.create({
            data: {
                userId,
                supply: dto.supply,
                daysClaimed: dto.daysClaimed,
                description: dto.description,
                lotNumber: dto.lotNumber,
                needsReplacement: (_a = dto.needsReplacement) !== null && _a !== void 0 ? _a : false,
                claimCategory: dto.claimCategory,
                errorCode: dto.errorCode,
                photoUrl: dto.photoUrl,
                failureDate: dto.failureDate ? (0, date_helper_1.parseDate)(dto.failureDate) : undefined,
                colocationDate: dto.colocationDate ? (0, date_helper_1.parseDate)(dto.colocationDate) : undefined,
            },
        });
        if (dto.supply === client_1.SupplyType.SENSOR ||
            dto.supply === client_1.SupplyType.PARCHE_200U ||
            dto.supply === client_1.SupplyType.PARCHE_300U) {
            await this.users.updateBalanceDays(userId, -((_b = dto.daysClaimed) !== null && _b !== void 0 ? _b : 0), dto.supply);
        }
        return this.prisma.claim.findUnique({
            where: { id: claim.id },
            include: { user: true },
        });
    }
    async findAll(query) {
        const { page, limit, sort } = query;
        const [total, data] = await Promise.all([
            this.prisma.claim.count(),
            this.prisma.claim.findMany({
                include: { user: true },
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
    async findOne(claimId, userId) {
        const claim = await this.prisma.claim.findUnique({
            where: { id: claimId },
            select: {
                id: true,
                supply: true,
                daysClaimed: true,
                status: true,
                description: true,
                needChange: true,
                lotNumber: true,
                needsReplacement: true,
                photoUrl: true,
                failureDate: true,
                colocationDate: true,
                createdAt: true,
                updatedAt: true,
                userId: true,
                deliveries: true,
            },
        });
        if (!claim)
            throw new common_1.NotFoundException("Claim not found");
        if (claim.userId !== userId)
            throw new common_1.NotFoundException("Claim not found");
        return claim;
    }
    async findByUserId(userId, query) {
        const where = { userId };
        if ((query === null || query === void 0 ? void 0 : query.from) || (query === null || query === void 0 ? void 0 : query.to)) {
            const dateFilter = (0, paginate_query_1.buildDateRangeFilter)(query.from, query.to);
            if (dateFilter)
                where.createdAt = dateFilter;
        }
        return this.prisma.claim.findMany({
            where,
            include: { user: true },
            orderBy: { createdAt: "desc" },
        });
    }
    async setStatus(id, status) {
        var _a;
        const claim = await this.prisma.claim.findUnique({ where: { id } });
        if (!claim)
            throw new common_1.NotFoundException("Claim not found");
        await this.prisma.claim.update({
            where: { id },
            data: { status },
        });
        if (status === "approved" &&
            (claim.supply === client_1.SupplyType.SENSOR ||
                claim.supply === client_1.SupplyType.PARCHE_200U ||
                claim.supply === client_1.SupplyType.PARCHE_300U)) {
            await this.users.updateBalanceDays(claim.userId, (_a = claim.daysClaimed) !== null && _a !== void 0 ? _a : 0, claim.supply);
        }
        return this.prisma.claim.findUnique({
            where: { id },
            include: { user: true },
        });
    }
};
exports.ClaimsService = ClaimsService;
exports.ClaimsService = ClaimsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService])
], ClaimsService);
//# sourceMappingURL=claims.service.js.map