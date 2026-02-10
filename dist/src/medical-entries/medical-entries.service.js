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
exports.MedicalEntriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const paginate_query_1 = require("../utils/paginate-query");
let MedicalEntriesService = class MedicalEntriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMyEntries(userId, query) {
        const { page, limit, sort, from, to } = query;
        const where = { patientId: userId };
        const dateFilter = (0, paginate_query_1.buildDateRangeFilter)(from, to);
        if (dateFilter)
            where.createdAt = dateFilter;
        const [total, data] = await Promise.all([
            this.prisma.medicalEntry.count({ where }),
            this.prisma.medicalEntry.findMany({
                where,
                include: { createdBy: { select: { fullName: true, email: true } } },
                orderBy: (0, paginate_query_1.buildOrderBy)(sort) || { visitDate: "desc" },
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
};
exports.MedicalEntriesService = MedicalEntriesService;
exports.MedicalEntriesService = MedicalEntriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MedicalEntriesService);
//# sourceMappingURL=medical-entries.service.js.map