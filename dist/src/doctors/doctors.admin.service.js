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
exports.DoctorsAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const organization_filter_helper_1 = require("../common/helpers/organization-filter.helper");
const paginate_query_1 = require("../utils/paginate-query");
let DoctorsAdminService = class DoctorsAdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, user) {
        var _a;
        const organizationId = (0, organization_filter_helper_1.getCreateOrgId)(user, data.organizationId);
        return this.prisma.doctor.create({
            data: {
                name: data.name,
                province: data.province,
                telephone: data.telephone,
                organizationId,
                healthcares: ((_a = data.healthcares) === null || _a === void 0 ? void 0 : _a.length)
                    ? {
                        create: data.healthcares.map((healthcareId) => ({
                            healthcareId,
                        })),
                    }
                    : undefined,
            },
            include: {
                healthcares: {
                    include: { healthcare: true },
                },
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
        const doctors = await this.prisma.doctor.findMany({
            where,
            include: {
                healthcares: {
                    include: { healthcare: true },
                },
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
        return doctors.map((doctor) => ({
            ...doctor,
            healthcares: doctor.healthcares.map((dh) => dh.healthcare),
        }));
    }
    async findById(id, user) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { id },
            include: {
                healthcares: {
                    include: { healthcare: true },
                },
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
        if (!doctor) {
            throw new common_1.NotFoundException("Doctor not found");
        }
        if (!(0, organization_filter_helper_1.canAccessOrg)(user, doctor.organizationId)) {
            throw new common_1.ForbiddenException("Cannot access doctor from different organization");
        }
        return {
            ...doctor,
            healthcares: doctor.healthcares.map((dh) => dh.healthcare),
        };
    }
    async update(id, data, user) {
        await this.findById(id, user);
        if (data.healthcares) {
            await this.prisma.doctorHealthcare.deleteMany({
                where: { doctorId: id },
            });
            await this.prisma.doctorHealthcare.createMany({
                data: data.healthcares.map((healthcareId) => ({
                    doctorId: id,
                    healthcareId,
                })),
            });
        }
        const { healthcares, organizationId, ...updateData } = data;
        return this.prisma.doctor.update({
            where: { id },
            data: updateData,
            include: {
                healthcares: {
                    include: { healthcare: true },
                },
            },
        });
    }
    async delete(id, user) {
        await this.findById(id, user);
        return this.prisma.doctor.delete({
            where: { id },
        });
    }
};
exports.DoctorsAdminService = DoctorsAdminService;
exports.DoctorsAdminService = DoctorsAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DoctorsAdminService);
//# sourceMappingURL=doctors.admin.service.js.map