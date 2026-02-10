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
exports.EducatorsAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const organization_filter_helper_1 = require("../common/helpers/organization-filter.helper");
const paginate_query_1 = require("../utils/paginate-query");
let EducatorsAdminService = class EducatorsAdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, user) {
        const organizationId = (0, organization_filter_helper_1.getCreateOrgId)(user, data.organizationId);
        return this.prisma.educator.create({
            data: {
                name: data.name,
                province: data.province,
                telephone: data.telephone,
                organizationId,
                userId: data.userId,
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
        return this.prisma.educator.findMany({
            where,
            include: {
                patients: {
                    where: { role: "patient" },
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                        phoneNumber: true,
                        dni: true,
                        address: true,
                        birthDate: true,
                        province: true,
                    },
                },
            },
        });
    }
    async findById(id, user) {
        const educator = await this.prisma.educator.findUnique({
            where: { id },
            include: {
                patients: {
                    where: { role: "patient" },
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                        phoneNumber: true,
                        dni: true,
                        address: true,
                        birthDate: true,
                        province: true,
                    },
                },
            },
        });
        if (!educator) {
            throw new common_1.NotFoundException("Educator not found");
        }
        if (!(0, organization_filter_helper_1.canAccessOrg)(user, educator.organizationId)) {
            throw new common_1.ForbiddenException("Cannot access educator from different organization");
        }
        return educator;
    }
    async update(id, data, user) {
        await this.findById(id, user);
        const { organizationId, userId, ...updateData } = data;
        return this.prisma.educator.update({
            where: { id },
            data: updateData,
        });
    }
    async delete(id, user) {
        await this.findById(id, user);
        return this.prisma.educator.delete({
            where: { id },
        });
    }
};
exports.EducatorsAdminService = EducatorsAdminService;
exports.EducatorsAdminService = EducatorsAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EducatorsAdminService);
//# sourceMappingURL=educators.admin.service.js.map