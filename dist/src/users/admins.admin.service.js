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
exports.AdminsAdminService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const supabase_service_1 = require("../supabase/supabase.service");
const date_helper_1 = require("../common/helpers/date.helper");
const organization_filter_helper_1 = require("../common/helpers/organization-filter.helper");
const paginate_query_1 = require("../utils/paginate-query");
let AdminsAdminService = class AdminsAdminService {
    constructor(prisma, supabase, config) {
        this.prisma = prisma;
        this.supabase = supabase;
        this.config = config;
    }
    async create(dto, user) {
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (exists)
            throw new common_1.ConflictException("Email already in use");
        let supabaseData;
        if (dto.sendInvite) {
            const redirectTo = `${this.config.get("FRONTEND_URL")}/update-password`;
            const { data, error } = await this.supabase.adminClient.auth.admin.inviteUserByEmail(dto.email, { redirectTo });
            if (error)
                throw new common_1.BadRequestException(error.message);
            supabaseData = data;
        }
        else {
            const { data, error } = await this.supabase.adminClient.auth.admin.createUser({
                email: dto.email,
                password: dto.password,
                email_confirm: true,
            });
            if (error) {
                throw new common_1.InternalServerErrorException(`Failed to create Supabase user: ${error.message}`);
            }
            supabaseData = data;
        }
        const organizationId = dto.organizationId;
        const created = await this.prisma.user.create({
            data: {
                email: dto.email,
                supabaseId: supabaseData.user.id,
                role: client_1.UserRole.admin,
                organizationId,
                fullName: dto.fullName,
                phoneNumber: dto.phoneNumber,
                dni: dto.dni,
                address: dto.address,
                birthDate: dto.birthDate ? (0, date_helper_1.parseDate)(dto.birthDate) : undefined,
                province: dto.province,
            },
        });
        return { id: created.id, email: created.email, role: created.role };
    }
    async findAll(query, user) {
        const { from, to } = query;
        const where = { role: client_1.UserRole.admin, ...(0, organization_filter_helper_1.buildOrgFilter)(user) };
        const dateFilter = (0, paginate_query_1.buildDateRangeFilter)(from, to);
        if (dateFilter)
            where.createdAt = dateFilter;
        return this.prisma.user.findMany({
            where,
            include: { organization: true },
        });
    }
    async findById(id) {
        const admin = await this.prisma.user.findUnique({
            where: { id },
            include: { organization: true },
        });
        if (!admin || admin.role !== client_1.UserRole.admin) {
            throw new common_1.NotFoundException("Admin not found");
        }
        return admin;
    }
    async update(id, dto) {
        const admin = await this.findById(id);
        if (admin.supabaseId && (dto.email || dto.password)) {
            const supabaseUpdate = {};
            if (dto.email)
                supabaseUpdate.email = dto.email;
            if (dto.password)
                supabaseUpdate.password = dto.password;
            const { error } = await this.supabase.adminClient.auth.admin.updateUserById(admin.supabaseId, supabaseUpdate);
            if (error) {
                throw new common_1.InternalServerErrorException(`Failed to update Supabase user: ${error.message}`);
            }
        }
        if (dto.email) {
            const exists = await this.prisma.user.findFirst({
                where: { email: dto.email, NOT: { id } },
            });
            if (exists)
                throw new common_1.ConflictException("Email already in use");
        }
        const { password, sendInvite, organizationId, ...updateFields } = dto;
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                ...updateFields,
                birthDate: dto.birthDate ? (0, date_helper_1.parseDate)(dto.birthDate) : undefined,
                ...(organizationId
                    ? { organization: { connect: { id: organizationId } } }
                    : {}),
            },
            include: { organization: true },
        });
        return updated;
    }
    async remove(id) {
        const admin = await this.findById(id);
        if (admin.supabaseId) {
            const { error } = await this.supabase.adminClient.auth.admin.deleteUser(admin.supabaseId);
            if (error) {
                throw new common_1.InternalServerErrorException(`Failed to delete Supabase user: ${error.message}`);
            }
        }
        await this.prisma.user.delete({ where: { id } });
        return { deleted: true };
    }
};
exports.AdminsAdminService = AdminsAdminService;
exports.AdminsAdminService = AdminsAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        supabase_service_1.SupabaseService,
        config_1.ConfigService])
], AdminsAdminService);
//# sourceMappingURL=admins.admin.service.js.map