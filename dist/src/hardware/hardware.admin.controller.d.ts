import { HardwareAdminService } from "./hardware.admin.service";
import { QueryOptionsDto } from "src/common/query/query-options.dto";
import { AuthUser } from "../common/helpers/organization-filter.helper";
export declare class HardwareAdminController {
    private readonly service;
    constructor(service: HardwareAdminService);
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
    findOne(id: string, user: AuthUser): Promise<{
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
    assign(hardwareId: string, body: {
        userId: string;
        observations?: string;
    }, user: AuthUser): Promise<{
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
    returnHardware(hardwareId: string, body: {
        observations?: string;
    }, user: AuthUser): Promise<{
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
    transfer(hardwareId: string, body: {
        userId: string;
        observations?: string;
    }, user: AuthUser): Promise<{
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
}
//# sourceMappingURL=hardware.admin.controller.d.ts.map