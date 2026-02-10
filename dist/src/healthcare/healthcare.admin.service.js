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
exports.HealthcareAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const organization_filter_helper_1 = require("../common/helpers/organization-filter.helper");
const paginate_query_1 = require("../utils/paginate-query");
let HealthcareAdminService = class HealthcareAdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, user) {
        const organizationId = (0, organization_filter_helper_1.getCreateOrgId)(user, data.organizationId);
        const code = data.name.toUpperCase();
        const exists = await this.prisma.healthcare.findFirst({
            where: {
                OR: [{ name: data.name }, { code }],
            },
        });
        if (exists)
            throw new common_1.ConflictException("Healthcare with this name or code exists");
        return this.prisma.healthcare.create({
            data: {
                name: data.name,
                code,
                organizationId,
            },
        });
    }
    async findAll(query, user) {
        const { from, to, organization } = query;
        const where = {
            ...(0, organization_filter_helper_1.buildOrgFilter)(user),
            ...(organization && { organizationId: organization }),
        };
        const dateFilter = (0, paginate_query_1.buildDateRangeFilter)(from, to);
        if (dateFilter)
            where.createdAt = dateFilter;
        return this.prisma.healthcare.findMany({
            where,
            include: {
                users: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                    },
                },
                doctors: {
                    include: {
                        doctor: {
                            select: {
                                id: true,
                                name: true,
                                province: true,
                                telephone: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findById(id) {
        return this.prisma.healthcare.findUnique({
            where: { id },
            include: {
                users: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                    },
                },
                doctors: {
                    include: {
                        doctor: {
                            select: {
                                id: true,
                                name: true,
                                province: true,
                                telephone: true,
                            },
                        },
                    },
                },
            },
        });
    }
};
exports.HealthcareAdminService = HealthcareAdminService;
exports.HealthcareAdminService = HealthcareAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HealthcareAdminService);
//# sourceMappingURL=healthcare.admin.service.js.map