import { PrismaService } from "../prisma/prisma.service";
import { CreateHardwareSupplyDto } from "./dto/create-hardware-supply.dto";
import { AuthUser } from "../common/helpers/organization-filter.helper";
import { Prisma } from "@prisma/client";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
export declare class HardwareAdminService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateHardwareSupplyDto, createdByUserId: string, organizationId?: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.HardwareType;
        serialNumber: string;
        status: import(".prisma/client").$Enums.HardwareStatus;
        assignedDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        organizationId: string | null;
    }>;
    deleteMany(ids: string[]): Promise<Prisma.BatchPayload>;
    findAll(query: QueryOptionsDto, user: AuthUser): Promise<({
        user: {
            id: string;
            email: string;
            fullName: string | null;
            healthcare: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string | null;
                name: string;
                code: string;
            } | null;
            doctor: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string | null;
                name: string;
                province: string;
                telephone: string | null;
            } | null;
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
            type: import(".prisma/client").$Enums.HardwareActivityType;
            createdAt: Date;
            userId: string;
            hardwareId: string;
            date: Date;
            previousUserId: string | null;
            newUserId: string | null;
            observations: string | null;
        })[];
    } & {
        id: string;
        type: import(".prisma/client").$Enums.HardwareType;
        serialNumber: string;
        status: import(".prisma/client").$Enums.HardwareStatus;
        assignedDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        organizationId: string | null;
    })[]>;
    findByUserId(userId: string): Promise<({
        user: {
            id: string;
            email: string;
            fullName: string | null;
            healthcare: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string | null;
                name: string;
                code: string;
            } | null;
            doctor: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string | null;
                name: string;
                province: string;
                telephone: string | null;
            } | null;
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
            type: import(".prisma/client").$Enums.HardwareActivityType;
            createdAt: Date;
            userId: string;
            hardwareId: string;
            date: Date;
            previousUserId: string | null;
            newUserId: string | null;
            observations: string | null;
        })[];
    } & {
        id: string;
        type: import(".prisma/client").$Enums.HardwareType;
        serialNumber: string;
        status: import(".prisma/client").$Enums.HardwareStatus;
        assignedDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        organizationId: string | null;
    })[]>;
    findOne(id: string, user?: AuthUser): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string | null;
            healthcare: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string | null;
                name: string;
                code: string;
            } | null;
            doctor: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string | null;
                name: string;
                province: string;
                telephone: string | null;
            } | null;
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
            type: import(".prisma/client").$Enums.HardwareActivityType;
            createdAt: Date;
            userId: string;
            hardwareId: string;
            date: Date;
            previousUserId: string | null;
            newUserId: string | null;
            observations: string | null;
        })[];
    } & {
        id: string;
        type: import(".prisma/client").$Enums.HardwareType;
        serialNumber: string;
        status: import(".prisma/client").$Enums.HardwareStatus;
        assignedDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        organizationId: string | null;
    }>;
    assign(hardwareId: string, userId: string, assignedByUserId: string, observations?: string): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string | null;
            healthcare: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string | null;
                name: string;
                code: string;
            } | null;
            doctor: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string | null;
                name: string;
                province: string;
                telephone: string | null;
            } | null;
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
            type: import(".prisma/client").$Enums.HardwareActivityType;
            createdAt: Date;
            userId: string;
            hardwareId: string;
            date: Date;
            previousUserId: string | null;
            newUserId: string | null;
            observations: string | null;
        })[];
    } & {
        id: string;
        type: import(".prisma/client").$Enums.HardwareType;
        serialNumber: string;
        status: import(".prisma/client").$Enums.HardwareStatus;
        assignedDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        organizationId: string | null;
    }>;
    returnHardware(hardwareId: string, returnedByUserId: string, observations?: string): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string | null;
            healthcare: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string | null;
                name: string;
                code: string;
            } | null;
            doctor: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string | null;
                name: string;
                province: string;
                telephone: string | null;
            } | null;
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
            type: import(".prisma/client").$Enums.HardwareActivityType;
            createdAt: Date;
            userId: string;
            hardwareId: string;
            date: Date;
            previousUserId: string | null;
            newUserId: string | null;
            observations: string | null;
        })[];
    } & {
        id: string;
        type: import(".prisma/client").$Enums.HardwareType;
        serialNumber: string;
        status: import(".prisma/client").$Enums.HardwareStatus;
        assignedDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        organizationId: string | null;
    }>;
    transfer(hardwareId: string, newUserId: string, transferredByUserId: string, observations?: string): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string | null;
            healthcare: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string | null;
                name: string;
                code: string;
            } | null;
            doctor: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                organizationId: string | null;
                name: string;
                province: string;
                telephone: string | null;
            } | null;
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
            type: import(".prisma/client").$Enums.HardwareActivityType;
            createdAt: Date;
            userId: string;
            hardwareId: string;
            date: Date;
            previousUserId: string | null;
            newUserId: string | null;
            observations: string | null;
        })[];
    } & {
        id: string;
        type: import(".prisma/client").$Enums.HardwareType;
        serialNumber: string;
        status: import(".prisma/client").$Enums.HardwareStatus;
        assignedDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        organizationId: string | null;
    }>;
    getErrorsByProduct(user: AuthUser): Promise<{
        product: string;
        productLabel: string;
        total: number;
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor: string[];
            hoverBackgroundColor: string[];
            borderWidth: number;
        }[];
    }[]>;
    getChartByType(user: AuthUser): Promise<{
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor: string[];
            hoverBackgroundColor: string[];
            borderWidth: number;
        }[];
    }>;
}
//# sourceMappingURL=hardware.admin.service.d.ts.map