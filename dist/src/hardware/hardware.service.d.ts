import { PrismaService } from "../prisma/prisma.service";
export declare class HardwareService {
    private prisma;
    constructor(prisma: PrismaService);
    findByUserId(userId: string): Promise<({
        user: {
            id: string;
            healthcare: {
                name: string;
                id: string;
                code: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string | null;
            } | null;
            doctor: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string | null;
                province: string;
                telephone: string | null;
            } | null;
            email: string;
            fullName: string | null;
        } | null;
        activityLogs: ({
            user: {
                id: string;
                email: string;
                fullName: string | null;
            };
            previousUser: {
                id: string;
                email: string;
                fullName: string | null;
            } | null;
            newUser: {
                id: string;
                email: string;
                fullName: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            type: import(".prisma/client").$Enums.HardwareActivityType;
            date: Date;
            observations: string | null;
            hardwareId: string;
            previousUserId: string | null;
            newUserId: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string | null;
        userId: string | null;
        status: import(".prisma/client").$Enums.HardwareStatus;
        type: import(".prisma/client").$Enums.HardwareType;
        serialNumber: string;
        assignedDate: Date | null;
    })[]>;
}
//# sourceMappingURL=hardware.service.d.ts.map