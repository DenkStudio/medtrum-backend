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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersAdminService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const paginate_query_1 = require("../utils/paginate-query");
const hardware_admin_service_1 = require("../hardware/hardware.admin.service");
const organization_filter_helper_1 = require("../common/helpers/organization-filter.helper");
const supabase_service_1 = require("../supabase/supabase.service");
const date_helper_1 = require("../common/helpers/date.helper");
let UsersAdminService = class UsersAdminService {
    constructor(prisma, hardwareService, supabase, config) {
        this.prisma = prisma;
        this.hardwareService = hardwareService;
        this.supabase = supabase;
        this.config = config;
    }
    async invite(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException("User not found");
        const redirectTo = `${this.config.get("FRONTEND_URL")}/update-password`;
        const { data, error } = await this.supabase.adminClient.auth.admin.inviteUserByEmail(user.email, {
            redirectTo,
        });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return { message: "Invitación enviada", data };
    }
    async create(dto, createdByUserId) {
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (exists)
            throw new common_1.ConflictException("Email already in use");
        let supabaseData;
        if (dto.sendInvite) {
            const redirectTo = `${this.config.get("FRONTEND_URL")}/update-password`;
            const { data, error } = await this.supabase.adminClient.auth.admin.inviteUserByEmail(dto.email, { redirectTo });
            if (error) {
                throw new common_1.BadRequestException(error.message);
            }
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
        let organizationId = dto.organization;
        if (createdByUserId && !organizationId) {
            const creator = await this.prisma.user.findUnique({
                where: { id: createdByUserId },
            });
            if (creator === null || creator === void 0 ? void 0 : creator.organizationId) {
                organizationId = creator.organizationId;
            }
        }
        const created = await this.prisma.user.create({
            data: {
                email: dto.email,
                supabaseId: supabaseData.user.id,
                role: dto.role,
                healthcareId: dto.healthcare,
                organizationId,
                fullName: dto.fullName,
                phoneNumber: dto.phoneNumber,
                dni: dto.dni,
                address: dto.address,
                birthDate: dto.birthDate ? (0, date_helper_1.parseDate)(dto.birthDate) : undefined,
                doctorId: dto.doctor,
                educatorId: dto.educator,
                province: dto.province,
            },
        });
        const createdHardwareIds = [];
        try {
            if (dto.role === client_1.UserRole.patient &&
                dto.hardwares &&
                dto.hardwares.length > 0) {
                const createdBy = createdByUserId || created.id;
                const hardwarePromises = dto.hardwares.flatMap((hardware) => {
                    const promises = [
                        this.hardwareService
                            .create({
                            type: hardware.type,
                            serialNumber: hardware.serialNumber,
                            userId: created.id,
                        }, createdBy, organizationId)
                            .then((hw) => {
                            createdHardwareIds.push(hw.id);
                            return hw;
                        }),
                    ];
                    if (hardware.type === client_1.HardwareType.Transmisor) {
                        promises.push(this.hardwareService
                            .create({
                            type: client_1.HardwareType.Cable_transmisor,
                            serialNumber: hardware.serialNumber,
                            userId: created.id,
                        }, createdBy, organizationId)
                            .then((hw) => {
                            createdHardwareIds.push(hw.id);
                            return hw;
                        }));
                    }
                    return promises;
                });
                await Promise.all(hardwarePromises);
            }
            return { id: created.id, email: created.email, role: created.role };
        }
        catch (error) {
            try {
                if (createdHardwareIds.length > 0) {
                    await this.hardwareService.deleteMany(createdHardwareIds);
                }
                await this.prisma.user.delete({ where: { id: created.id } });
                await this.supabase.adminClient.auth.admin.deleteUser(supabaseData.user.id);
            }
            catch (rollbackError) {
                console.error("Error during rollback:", rollbackError);
            }
            throw error;
        }
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async findAll(query, user) {
        const { page, limit, search, sort, role, healthcare, doctor, from, to } = query;
        const orgFilter = (0, organization_filter_helper_1.buildOrgFilter)(user);
        const where = { ...orgFilter };
        const dateFilter = (0, paginate_query_1.buildDateRangeFilter)(from, to);
        if (dateFilter)
            where.createdAt = dateFilter;
        if (role) {
            where.role = role;
        }
        if (healthcare) {
            where.healthcareId = healthcare;
        }
        if (doctor) {
            where.doctorId = doctor;
        }
        const searchFilter = (0, paginate_query_1.buildSearchFilter)(search, ["email", "fullName"]);
        if (searchFilter) {
            where.AND = [searchFilter];
        }
        const [total, data] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
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
    async findById(id, user) {
        const found = await this.prisma.user.findUnique({
            where: { id },
            include: {
                organization: true,
                healthcare: true,
                doctor: true,
                educator: true,
                deliveries: {
                    include: {
                        claim: true,
                        assignedBy: {
                            select: { id: true, fullName: true, email: true },
                        },
                    },
                },
                claims: { orderBy: { createdAt: "desc" } },
                hardwareSupplies: true,
                medicalEntries: { orderBy: { createdAt: "desc" } },
            },
        });
        if (user && found && !(0, organization_filter_helper_1.canAccessOrg)(user, found.organizationId)) {
            throw new common_1.ForbiddenException("Cannot access user from different organization");
        }
        return found;
    }
    async update(id, dto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException("User not found");
        const updateData = {};
        if (user.supabaseId && (dto.email || dto.password)) {
            const supabaseUpdate = {};
            if (dto.email)
                supabaseUpdate.email = dto.email;
            if (dto.password)
                supabaseUpdate.password = dto.password;
            const { error } = await this.supabase.adminClient.auth.admin.updateUserById(user.supabaseId, supabaseUpdate);
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
            updateData.email = dto.email;
        }
        if (dto.role) {
            updateData.role = dto.role;
        }
        if (dto.organization) {
            updateData.organization = { connect: { id: dto.organization } };
        }
        if (dto.healthcare) {
            updateData.healthcare = { connect: { id: dto.healthcare } };
        }
        if (dto.fullName !== undefined) {
            updateData.fullName = dto.fullName;
        }
        if (dto.phoneNumber !== undefined) {
            updateData.phoneNumber = dto.phoneNumber;
        }
        if (dto.dni !== undefined) {
            updateData.dni = dto.dni;
        }
        if (dto.address !== undefined) {
            updateData.address = dto.address;
        }
        if (dto.birthDate) {
            updateData.birthDate = (0, date_helper_1.parseDate)(dto.birthDate);
        }
        if (dto.doctor !== undefined) {
            if (dto.doctor) {
                updateData.doctor = { connect: { id: dto.doctor } };
            }
            else {
                updateData.doctor = { disconnect: true };
            }
        }
        if (dto.educator !== undefined) {
            if (dto.educator) {
                updateData.educator = { connect: { id: dto.educator } };
            }
            else {
                updateData.educator = { disconnect: true };
            }
        }
        if (dto.province !== undefined) {
            updateData.province = dto.province;
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data: updateData,
        });
        return { id: updated.id, email: updated.email, role: updated.role };
    }
    async remove(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException("User not found");
        if (user.supabaseId) {
            const { error } = await this.supabase.adminClient.auth.admin.deleteUser(user.supabaseId);
            if (error) {
                throw new common_1.InternalServerErrorException(`Failed to delete Supabase user: ${error.message}`);
            }
        }
        await this.prisma.user.delete({ where: { id } });
        return { deleted: true };
    }
    async getUsersWithClaims(user) {
        const orgFilter = (0, organization_filter_helper_1.buildOrgFilter)(user);
        const usersWithClaims = await this.prisma.claim.findMany({
            where: { user: orgFilter },
            select: { userId: true },
            distinct: ["userId"],
        });
        if (usersWithClaims.length === 0) {
            return [];
        }
        const userIds = usersWithClaims.map((c) => c.userId);
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds }, ...orgFilter },
            include: {
                healthcare: true,
                organization: true,
            },
        });
        const sortedUsers = users.sort((a, b) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const aSensorNeg = ((_a = a.balanceDaysSensor) !== null && _a !== void 0 ? _a : 0) < 0;
            const aParcheNeg = ((_b = a.balanceDaysParche) !== null && _b !== void 0 ? _b : 0) < 0;
            const bSensorNeg = ((_c = b.balanceDaysSensor) !== null && _c !== void 0 ? _c : 0) < 0;
            const bParcheNeg = ((_d = b.balanceDaysParche) !== null && _d !== void 0 ? _d : 0) < 0;
            const aHasNegative = aSensorNeg || aParcheNeg;
            const bHasNegative = bSensorNeg || bParcheNeg;
            if (aHasNegative && !bHasNegative)
                return -1;
            if (!aHasNegative && bHasNegative)
                return 1;
            if (aHasNegative && bHasNegative) {
                const aMinBalance = Math.min((_e = a.balanceDaysSensor) !== null && _e !== void 0 ? _e : 0, (_f = a.balanceDaysParche) !== null && _f !== void 0 ? _f : 0);
                const bMinBalance = Math.min((_g = b.balanceDaysSensor) !== null && _g !== void 0 ? _g : 0, (_h = b.balanceDaysParche) !== null && _h !== void 0 ? _h : 0);
                return aMinBalance - bMinBalance;
            }
            return (a.fullName || "").localeCompare(b.fullName || "");
        });
        return sortedUsers;
    }
    async getUsers(user, query) {
        const orgFilter = (0, organization_filter_helper_1.buildOrgFilter)(user);
        const where = { ...orgFilter };
        if (query === null || query === void 0 ? void 0 : query.role) {
            where.role = query.role;
        }
        if (query === null || query === void 0 ? void 0 : query.healthcare) {
            where.healthcareId = query.healthcare;
        }
        if (query === null || query === void 0 ? void 0 : query.doctor) {
            where.doctorId = query.doctor;
        }
        return this.prisma.user.findMany({
            where,
            include: {
                healthcare: true,
                doctor: true,
            },
        });
    }
    async getPatientsOverview(user) {
        const orgFilter = (0, organization_filter_helper_1.buildOrgFilter)(user);
        const where = { role: "patient", ...orgFilter };
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);
        const [totalPatients, patients, recentPatients] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where: { ...where, createdAt: { gte: twelveMonthsAgo } },
                select: { createdAt: true },
                orderBy: { createdAt: "asc" },
            }),
            this.prisma.user.findMany({
                where,
                select: { id: true, fullName: true, createdAt: true },
                orderBy: { createdAt: "desc" },
                take: 4,
            }),
        ]);
        const labels = [];
        const data = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(twelveMonthsAgo);
            date.setMonth(date.getMonth() + i);
            const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            labels.push(label);
            data.push(0);
        }
        for (const patient of patients) {
            const d = new Date(patient.createdAt);
            const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            const idx = labels.indexOf(label);
            if (idx !== -1) {
                data[idx]++;
            }
        }
        return {
            totalPatients,
            trendline: { labels, data },
            recentPatients,
        };
    }
};
exports.UsersAdminService = UsersAdminService;
exports.UsersAdminService = UsersAdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => hardware_admin_service_1.HardwareAdminService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        hardware_admin_service_1.HardwareAdminService,
        supabase_service_1.SupabaseService,
        config_1.ConfigService])
], UsersAdminService);
//# sourceMappingURL=users.admin.service.js.map