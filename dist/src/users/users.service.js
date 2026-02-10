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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updateBalanceDays(patientId, delta, supply) {
        var _a, _b, _c;
        const patient = await this.prisma.user.findUnique({
            where: { id: patientId },
        });
        if (!patient)
            throw new common_1.NotFoundException("Patient not found");
        const fieldName = supply === client_1.SupplyType.SENSOR
            ? "balanceDaysSensor"
            : "balanceDaysParche";
        const currentBalance = ((_a = patient[fieldName]) !== null && _a !== void 0 ? _a : 0) + (delta !== null && delta !== void 0 ? delta : 0);
        const updatedUser = await this.prisma.user.update({
            where: { id: patientId },
            data: { [fieldName]: currentBalance },
        });
        return {
            patientId: updatedUser.id,
            balanceDaysSensor: (_b = updatedUser.balanceDaysSensor) !== null && _b !== void 0 ? _b : 0,
            balanceDaysParche: (_c = updatedUser.balanceDaysParche) !== null && _c !== void 0 ? _c : 0,
        };
    }
    async findMyProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                organization: true,
                healthcare: true,
                deliveries: {
                    include: {
                        assignedBy: {
                            select: { id: true, fullName: true, email: true },
                        },
                    },
                },
            },
        });
        if (!user)
            throw new common_1.NotFoundException("User not found");
        const disposables = user.deliveries
            .filter((d) => d.type === "supply_delivery")
            .map((delivery) => ({
            itemName: delivery.itemName,
            quantity: delivery.quantity,
            deliveryDate: delivery.date,
            assignedBy: delivery.assignedBy,
            observations: delivery.observations,
        }));
        const hardware = await this.prisma.hardwareSupply.findMany({
            where: { userId },
            include: {
                activityLogs: {
                    include: {
                        user: { select: { id: true, fullName: true, email: true } },
                        previousUser: { select: { id: true, fullName: true, email: true } },
                        newUser: { select: { id: true, fullName: true, email: true } },
                    },
                },
            },
        });
        return {
            ...user,
            disposables,
            hardware,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map