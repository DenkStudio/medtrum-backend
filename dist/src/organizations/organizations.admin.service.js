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
exports.OrganizationsAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const paginate_query_1 = require("../utils/paginate-query");
let OrganizationsAdminService = class OrganizationsAdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const exists = await this.prisma.organization.findFirst({
            where: {
                OR: [{ name: data.name }, { code: data.code }],
            },
        });
        if (exists)
            throw new common_1.ConflictException("Organization exists");
        return this.prisma.organization.create({ data });
    }
    findAll(query) {
        const { from, to } = query;
        const where = {};
        const dateFilter = (0, paginate_query_1.buildDateRangeFilter)(from, to);
        if (dateFilter)
            where.createdAt = dateFilter;
        return this.prisma.organization.findMany({
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
            },
        });
    }
};
exports.OrganizationsAdminService = OrganizationsAdminService;
exports.OrganizationsAdminService = OrganizationsAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizationsAdminService);
//# sourceMappingURL=organizations.admin.service.js.map